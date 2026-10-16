import { Injectable } from '@nestjs/common';
import moment from 'moment';
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
    const whTaxPercentage = 10;
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

    return newInvoice;
  }

  async getInvoices(invoiceId: number) {
    const result = await CorporateInvoice.query().findById(invoiceId);
    return result ?? null;
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
