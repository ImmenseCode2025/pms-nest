import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import moment from 'moment';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { AppConfigService } from 'src/core/config/app-config.service';
import { AppException } from 'src/core/exception/app-exception';
import { GlobalHelper } from 'src/core/helper/global-helper';
import { CorporateBillingPlan } from 'src/core/orm/entities/corporate-billing-plan.entity';
import { CorporateCards } from 'src/core/orm/entities/corporate-cards.entity';
import { CorporateInvoice } from 'src/core/orm/entities/corporate-invoice.entity';
import { CorporateResetPassword } from 'src/core/orm/entities/corporate-reset-password.entity';
import { Corporate } from 'src/core/orm/entities/corporate.entity';
import { PortalNotification } from 'src/core/orm/entities/portal-notification.entity';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';

@Injectable()
export class CorporatesService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly appConfigService: AppConfigService) {
    this.bucketName = this.appConfigService.r2BucketName;
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: this.appConfigService.r2Endpoint,
      credentials: {
        accessKeyId: this.appConfigService.r2AccessKeyId,
        secretAccessKey: this.appConfigService.r2SecretAccessKey,
      },
    });
  }

  async findOne(id: number) {
    const corporate = await Corporate.query().findById(id);
    if (!corporate) {
      AppException.notFound({ message: `Corporate #${id} not found` });
    }
    return corporate;
  }

  async generateInvoice(dto: GenerateInvoiceDto, req) {
    const corporate: any = await Corporate.query().findById(dto.corporateId);
    if (!corporate) {
      AppException.notFound({
        message: `Corporate #${dto.corporateId} not found`,
      });
    }

    if (moment(dto.billingPeriodStart).isAfter(moment(dto.billingPeriodEnd))) {
      AppException.badRequest({
        message: 'billingPeriodStart cannot be after billingPeriodEnd',
      });
    }


    const existingInvoice = await CorporateInvoice.query()
      .where('corporateId', dto.corporateId)
      .where('billingPeriodStart', '<=', dto.billingPeriodEnd)
      .where('billingPeriodEnd', '>=', dto.billingPeriodStart)
      .first();

    if (existingInvoice) {
      AppException.badRequest({
        message: `Invoice already exists for this period (${existingInvoice.billingPeriodStart} to ${existingInvoice.billingPeriodEnd}) with invoice #${existingInvoice.invoiceNumber}`,
      });
    }

    const corporateId = dto.corporateId;
    const monthTag = moment(dto.billingPeriodStart).format('YYYYMM');

    // Pricing & quantities
    const quantity = Number(corporate.quantity ?? 0);
    const unitPrice = Number(corporate.unitPrice ?? 0);
    const unitType = corporate.unitType || 'vehicle';
    const subtotal = Number((quantity * unitPrice).toFixed(2));
    const discountPercentage = 0;
    const discountAmount = 0;
    const salesTaxPercentage = 5;
    const salesTaxAmount = Number(
      ((subtotal * salesTaxPercentage) / 100).toFixed(2),
    );
    const whTaxPercentage = 15;
    const whTaxAmount = Number(((subtotal * whTaxPercentage) / 100).toFixed(2));
    const totalAmount = Number(
      (subtotal + salesTaxAmount + whTaxAmount).toFixed(2),
    );

    // Dates using moment.js
    const invoiceDate = moment().format('YYYY-MM-DD');
    const dueDate = moment(dto.billingPeriodEnd)
      .add(30, 'days')
      .format('YYYY-MM-DD');

    // Registered vehicle snapshot
    const cards: any[] = await CorporateCards.query()
      .where('corporate', corporateId)
      .whereNotNull('vehicleNumber');
    const vehicleSnapshot = cards.map((c) => c.vehicleNumber).filter(Boolean);

    const invoiceMonth = moment(dto.billingPeriodStart).format('YYYY-MM');

    const newInvoice = await CorporateInvoice.query().insertAndFetch({
      invoiceNumber: `INV-${monthTag}-${corporateId}`,
      corporateId,
      billingPeriodStart: dto.billingPeriodStart,
      billingPeriodEnd: dto.billingPeriodEnd,
      invoiceDate,
      dueDate,
      invoiceMonth,
      unitType,
      unitPrice,
      quantity,
      billableVehicleCount: quantity,
      subtotal,
      discountPercentage,
      discountAmount,
      salesTaxPercentage,
      salesTaxAmount,
      whTaxPercentage,
      whTaxAmount,
      totalAmount,
      paidAmount: 0,
      arrears: 0,
      status: 'pending',
      vehicleSnapshot,
      billingBreakdown: {
        unitType,
        quantity,
        unitPrice,
        subtotal,
        discountPercentage,
        discountAmount,
        salesTaxPercentage,
        salesTaxAmount,
        whTaxPercentage,
        whTaxAmount,
        totalAmount,
      },
      notes: dto.notes || null,
      createdAt: GlobalHelper.getDateTime('YYYY-MM-DD HH:mm:ss'),
      updatedAt: GlobalHelper.getDateTime('YYYY-MM-DD HH:mm:ss'),
    });

    try {
      const pdf = await this.generateInvoicePdf(newInvoice.id);
      newInvoice.pdfPath = pdf.url;
    } catch (e) {
      console.error('Auto-generate invoice PDF error on create:', e);
    }

    return newInvoice;
  }

  async getInvoices(invoiceId: number) {
    const result: any = await CorporateInvoice.query().findById(invoiceId);
    if (result && !result.pdfPath) {
      try {
        const generated = await this.generateInvoicePdf(invoiceId);
        result.pdfPath = generated.url;
      } catch (e) {
        console.error('Auto-generate invoice PDF error on get:', e);
      }
    }
    return result ?? null;
  }

  async generateInvoicePdf(invoiceId: number): Promise<{ url: string; invoiceNumber: string; id: number }> {
    const invoice: any = await CorporateInvoice.query().findById(invoiceId);
    if (!invoice) {
      AppException.notFound({ message: `Corporate invoice #${invoiceId} not found` });
    }

    const corporate: any = await Corporate.query().findById(invoice.corporateId);

    const logoPath = path.join(process.cwd(), 'html-templates', 'assets', 'ajcl-logo.png');
    let logoBase64 = '';
    if (fs.existsSync(logoPath)) {
      logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;
    }

    const invoiceNumber = invoice.invoiceNumber || `INV-${invoice.id}`;
    const invoiceDate = invoice.invoiceDate
      ? moment(invoice.invoiceDate).format('DD MMM YYYY')
      : moment().format('DD MMM YYYY');
    const dueDate = invoice.dueDate
      ? moment(invoice.dueDate).format('DD MMM YYYY')
      : 'Immediate';
    const invoiceMonth = invoice.billingPeriodStart
      ? moment(invoice.billingPeriodStart).format('MMMM YYYY')
      : moment().format('MMMM YYYY');
    const billingPeriod = invoice.billingPeriodStart && invoice.billingPeriodEnd
      ? `${moment(invoice.billingPeriodStart).format('DD MMM')} – ${moment(invoice.billingPeriodEnd).format('DD MMM YYYY')}`
      : moment().format('MMMM YYYY');
    const status = String(invoice.status || 'pending').toLowerCase();
    const isPaid = status === 'paid';
    const isOverdue = status === 'overdue' || status === 'declined';
    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

    const corporateName = corporate?.name || 'Customer Company Name';
    const contactPerson = corporate?.contactPersonName || 'Account Manager';
    const billingAddress = corporate?.location || corporate?.address || 'Main Commercial Area';
    const cityCountry = 'Karachi, Pakistan';
    const contactInfo = [corporate?.email, corporate?.contactNumber].filter(Boolean).join(' · ') || 'billing@company.com';
    const taxId = corporate?.registrationNumber || '—';
    const corporateId = corporate?.id || invoice.corporateId;

    const rawUnit = String(invoice.unitType || corporate?.unitType || 'slots').toLowerCase();
    const isSlot = rawUnit.includes('slot');
    const quantityHeader = isSlot ? 'Number of Slots' : 'Number of Vehicles';
    const priceHeader = isSlot ? 'Slot Price' : 'Vehicle Price';
    const unitType = isSlot ? 'Slots' : 'Vehicles';
    const unitTypeLower = isSlot ? 'slots' : 'vehicles';
    const quantity = Number(invoice.quantity || invoice.billableVehicleCount || 1);
    const billingPlan = corporate?.billingPlan || '—';
    const notes = invoice.notes || `${invoiceMonth} monthly billing invoice`;

    const unitPrice = Number(invoice.unitPrice || 0);
    const subtotal = Number(invoice.subtotal || quantity * unitPrice);
    const discountPercentage = Number(invoice.discountPercentage || 0);
    const discountAmount = Number(invoice.discountAmount || 0);
    const salesTaxPercentage = Number(invoice.salesTaxPercentage || 0);
    const salesTaxAmount = Number(invoice.salesTaxAmount || 0);
    const whTaxPercentage = Number(invoice.whTaxPercentage || 0);
    const whTaxAmount = Number(invoice.whTaxAmount || 0);
    const totalAmount = Number(invoice.totalAmount || (subtotal - discountAmount + salesTaxAmount + whTaxAmount).toFixed(2));
    const paidAmount = Number(invoice.paidAmount || 0);
    const arrears = Number(invoice.arrears || 0);
    const balanceDue = Number((totalAmount - paidAmount).toFixed(2));

    const formatCurrency = (val: number) =>
      val.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const templateData = {
      logoBase64,
      invoiceNumber,
      invoiceDate,
      dueDate,
      invoiceMonth,
      billingPeriod,
      status,
      isPaid,
      isOverdue,
      statusLabel,
      corporateName,
      contactPerson,
      billingAddress,
      cityCountry,
      contactInfo,
      taxId,
      corporateId,
      unitType,
      unitTypeLower,
      quantityHeader,
      priceHeader,
      quantity,
      billingPlan,
      notes,
      unitPriceFormatted: formatCurrency(unitPrice),
      subtotalFormatted: formatCurrency(subtotal),
      discountPercentage,
      discountAmountFormatted: formatCurrency(discountAmount),
      salesTaxPercentage,
      salesTaxAmountFormatted: formatCurrency(salesTaxAmount),
      whTaxPercentage,
      whTaxAmountFormatted: formatCurrency(whTaxAmount),
      totalAmountFormatted: formatCurrency(totalAmount),
      paidAmountFormatted: formatCurrency(paidAmount),
      arrearsFormatted: formatCurrency(arrears),
      balanceDueFormatted: formatCurrency(balanceDue),
    };



    const html = await this.renderHtmlTemplate(
      'corporates/corporate-invoice.html',
      templateData,
    );

    const pdfBuffer = await this.htmlToPdfBuffer(html, false);
    const fileKey = `report/corporate-invoices/invoice-${invoiceNumber}-${Date.now()}.pdf`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
      }),
    );

    const publicUrl = this.appConfigService.getR2Url(fileKey);

    await CorporateInvoice.query().findById(invoiceId).patch({ pdfPath: publicUrl });

    return {
      url: publicUrl,
      invoiceNumber,
      id: invoice.id,
    };
  }

  private async htmlToPdfBuffer(html: string, landscape: boolean = false): Promise<Buffer> {
    const launchOptions: any = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    };
    if (process.env.CHROME_DRIVER_PATH && fs.existsSync(process.env.CHROME_DRIVER_PATH)) {
      launchOptions.executablePath = process.env.CHROME_DRIVER_PATH;
    }

    const browser = await puppeteer.launch(launchOptions);

    try {
      const page = await browser.newPage();
      await page.setContent(html, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });

      // Safely wait for custom fonts without network idle hangs
      try {
        await page.evaluateHandle('document.fonts.ready');
      } catch (err) {
        // Fallback silently if offline
      }

      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape,
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }


  }

  private async renderHtmlTemplate(templatePath: string, data: any): Promise<string> {
    const fullPath = path.join(process.cwd(), 'html-templates', templatePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Template file not found: ${fullPath}`);
    }
    const htmlTemplate = fs.readFileSync(fullPath, 'utf8');
    const compiledTemplate = handlebars.compile(htmlTemplate);
    return compiledTemplate(data);
  }


  async delete(id: number) {
    // 1. Check if Corporate exists
    const corporate: any = await Corporate.query().findById(id);
    if (!corporate) {
      AppException.notFound({ message: `Corporate #${id} not found` });
    }

    // 2. Validate status is 'pending'
    const currentStatus = (
      corporate.status ||
      corporate.statusCorporate ||
      ''
    ).toLowerCase();

    if (currentStatus !== 'pending') {
      AppException.badRequest({
        message: `Only corporates with 'pending' status can be deleted. Current status is '${corporate.status || corporate.statusCorporate}'.`,
      });
    }

    // 3. Delete corporate and its related child records inside an atomic transaction
    await Corporate.transaction(async (trx) => {
      // Delete password reset OTPs
      await CorporateResetPassword.query()
        .transacting(trx)
        .where('corporate', id)
        .delete();

      // Delete portal notifications
      await PortalNotification.query()
        .transacting(trx)
        .where('corporateId', id)
        .delete();

      // Delete corporate cards
      await CorporateCards.query()
        .transacting(trx)
        .where('corporate', id)
        .delete();

      // Delete billing plans
      await CorporateBillingPlan.query()
        .transacting(trx)
        .where('corporateId', id)
        .delete();

      // Delete corporate invoices
      await CorporateInvoice.query()
        .transacting(trx)
        .where('corporateId', id)
        .delete();

      // Delete the Corporate record itself
      await Corporate.query().transacting(trx).deleteById(id);
    });

    return { id, deleted: true };
  }
}
