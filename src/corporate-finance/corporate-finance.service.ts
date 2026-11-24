import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger, Optional } from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';
import * as fs from 'fs';
import moment from 'moment';
import * as path from 'path';
import { CorporatesService } from 'src/corporates/corporates.service';
import { AppException } from 'src/core/exception/app-exception';
import { CorporateBillingPlan } from 'src/core/orm/entities/corporate-billing-plan.entity';
import { CorporateCards } from 'src/core/orm/entities/corporate-cards.entity';
import { CorporateInvoiceLog } from 'src/core/orm/entities/corporate-invoice-log.entity';
import { CorporateInvoicePayment } from 'src/core/orm/entities/corporate-invoice-payment.entity';
import { CorporateInvoice } from 'src/core/orm/entities/corporate-invoice.entity';
import { Corporate } from 'src/core/orm/entities/corporate.entity';
import { CreateBillingPlanDto } from './dto/create-billing-plan.dto';
import { GenerateCorporateInvoiceDto } from './dto/generate-invoice.dto';

// Statuses treated as "unpaid" (pending-generation tab + pending stats)
const UNPAID_STATUSES = ['issued', 'pending', 'overdue', 'declined'];
const PAID_STATUSES = ['paid', 'partially_paid'];
const DELETABLE_STATUSES = ['draft', 'issued', 'pending', 'declined'];
const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Admin-side corporate finance (billing plans, invoices, payments).
 * Port of legacy cda-parking-chat-backend services/corporateFinanceService.js.
 *
 * Real DB columns (verified): corporates.status (entity alias statusCorporate),
 * corporate_cards.corporate (FK) and corporate_cards.status (entity alias requestStatus).
 */
@Injectable()
export class CorporateFinanceService {
  private readonly logger = new Logger(CorporateFinanceService.name);

  constructor(
    @Optional() private readonly mailerService?: MailerService,
    @Optional() private readonly corporatesService?: CorporatesService,
  ) {}

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private getTaxRate(): number {
    const raw = parseFloat(process.env.INVOICE_TAX_RATE || '0');
    return isNaN(raw) ? 0 : raw;
  }

  private now(): string {
    return moment().format('YYYY-MM-DD HH:mm:ss');
  }

  private round2(value: number): number {
    return Number((Number(value) || 0).toFixed(2));
  }

  /** DATE column -> 'YYYY-MM-DD' (connection tz is 'Z', so read in UTC). */
  private toDateOnly(value: any): string | null {
    if (value === null || value === undefined || value === '') return null;
    if (value instanceof Date) return moment.utc(value).format('YYYY-MM-DD');
    const str = String(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const m = moment(str);
    return m.isValid() ? m.utcOffset(300).format('YYYY-MM-DD') : str;
  }

  private toTime(value: any): number {
    return new Date(this.toDateOnly(value) as string).getTime();
  }

  private formatInvoiceDates<T extends Record<string, any>>(row: T): T {
    if (!row) return row;
    const out: any = { ...row };
    for (const key of ['billingPeriodStart', 'billingPeriodEnd', 'invoiceDate', 'dueDate']) {
      if (key in out) out[key] = this.toDateOnly(out[key]);
    }
    return out;
  }

  private formatPaymentDates<T extends Record<string, any>>(row: T): T {
    if (!row) return row;
    return { ...row, paymentDate: this.toDateOnly((row as any).paymentDate) };
  }

  private formatPlanDates<T extends Record<string, any>>(row: T): T {
    if (!row) return row;
    return { ...row, effectiveFrom: this.toDateOnly((row as any).effectiveFrom) };
  }

  /** Tax amount stored by any generator (this module: salesTax only; corporates module: salesTax + whTax). */
  private invoiceTaxAmount(inv: any): number {
    return (parseFloat(inv.salesTaxAmount) || 0) + (parseFloat(inv.whTaxAmount) || 0);
  }

  private invoiceTaxRate(inv: any): number {
    if (this.invoiceTaxAmount(inv) <= 0) return 0;
    return (parseFloat(inv.salesTaxPercentage) || 0) + (parseFloat(inv.whTaxPercentage) || 0);
  }

  /** Adds legacy-named computed fields (discount, taxAmount, taxRate) to a list row. */
  private withListComputed(inv: any) {
    const row = this.formatInvoiceDates(inv.toJSON ? inv.toJSON() : inv);
    return {
      ...row,
      discount: parseFloat(row.discountAmount) || 0,
      taxAmount: this.invoiceTaxAmount(row),
      taxRate: this.invoiceTaxRate(row),
    };
  }

  /**
   * Invoice number: INV-YYYYMM-{corporateId}-{sequence}.
   * Legacy used count+1; we use max(sequence)+1 so a deleted invoice cannot cause a duplicate number.
   */
  private async generateInvoiceNumber(corporateId: number, periodStart: string, trx?: any) {
    const yyyymm = periodStart.replace(/-/g, '').slice(0, 6);
    const prefix = `INV-${yyyymm}-${corporateId}-`;
    const rows: any[] = await CorporateInvoice.query(trx)
      .select('invoiceNumber')
      .where('invoiceNumber', 'like', `${prefix}%`);
    let max = 0;
    for (const r of rows) {
      const seq = parseInt(String(r.invoiceNumber).slice(prefix.length), 10);
      if (!isNaN(seq) && seq > max) max = seq;
    }
    return `${prefix}${max + 1}`;
  }

  private async logInvoiceAction(
    invoiceId: number,
    action: string,
    { previousStatus = null, newStatus = null, performedBy = null, meta = null, billingBreakdown = null }: any = {},
    trx?: any,
  ) {
    const ts = this.now();
    return CorporateInvoiceLog.knex()('corporate_invoice_logs')
      .modify((q) => (trx ? q.transacting(trx) : q))
      .insert({
        invoiceId,
        action,
        previousStatus: previousStatus || null,
        newStatus: newStatus || null,
        performedBy: performedBy || null,
        meta: meta ? JSON.stringify(meta) : null,
        billingBreakdown: billingBreakdown ? JSON.stringify(billingBreakdown) : null,
        createdAt: ts,
        updatedAt: ts,
      });
  }

  /** Distinct approved vehicle numbers of a corporate (legacy ignores the period dates). */
  private async getBillableVehicles(corporateId: number): Promise<string[]> {
    const cards: any[] = await CorporateCards.query()
      .select('vehicleNumber')
      .where('corporate', corporateId)
      .where('status', 'approved')
      .orderBy('id', 'asc');
    const seen = new Set<string>();
    const vehicles: string[] = [];
    for (const card of cards) {
      if (!seen.has(card.vehicleNumber)) {
        seen.add(card.vehicleNumber);
        vehicles.push(card.vehicleNumber);
      }
    }
    return vehicles;
  }

  /** Plans with effectiveFrom <= periodEnd (any isActive), oldest first. */
  private async getBillingPlansUpTo(corporateId: number, periodEnd: string) {
    return CorporateBillingPlan.query()
      .where('corporateId', corporateId)
      .where('effectiveFrom', '<=', periodEnd)
      .orderBy('effectiveFrom', 'asc');
  }

  /** Pro-rated subtotal across plan segments (same maths as legacy). */
  private computeSegments(plans: any[], periodStart: string, periodEnd: string, vehicleCount: number) {
    const pStart = new Date(periodStart).getTime();
    const pEnd = new Date(periodEnd).getTime();
    const billingPeriodDays = Math.floor((pEnd - pStart) / DAY_MS) + 1;
    let subtotal = 0;
    const billingBreakdown: any[] = [];

    for (let i = 0; i < plans.length; i++) {
      const currentPlan = plans[i];
      const nextPlan = plans[i + 1];
      const segmentStart = new Date(Math.max(pStart, this.toTime(currentPlan.effectiveFrom)));
      const segmentEnd = new Date(
        Math.min(pEnd, nextPlan ? this.toTime(nextPlan.effectiveFrom) - DAY_MS : pEnd),
      );
      if (segmentStart > segmentEnd) continue;

      const segmentDays = Math.floor((segmentEnd.getTime() - segmentStart.getTime()) / DAY_MS) + 1;
      const lineTotal = vehicleCount * Number(currentPlan.pricePerVehicle) * (segmentDays / billingPeriodDays);
      subtotal += lineTotal;

      billingBreakdown.push({
        billingPlanId: currentPlan.id,
        planName: currentPlan.name || `Plan from ${this.toDateOnly(currentPlan.effectiveFrom)}`,
        effectiveFrom: segmentStart,
        effectiveTo: segmentEnd,
        vehicleCount,
        pricePerVehicle: Number(currentPlan.pricePerVehicle),
        days: segmentDays,
        lineTotal: Number(lineTotal.toFixed(2)),
      });
    }
    return { subtotal, billingBreakdown };
  }

  // ─── Billing Plan ──────────────────────────────────────────────────────────

  async createBillingPlan(dto: CreateBillingPlanDto) {
    const corporateId = Number(dto.corporateId);
    const pricePerVehicle = Number(dto.pricePerVehicle);
    if (!corporateId || isNaN(pricePerVehicle)) {
      AppException.badRequest({ message: 'corporateId and pricePerVehicle are required' });
    }
    const corporate = await Corporate.query().findById(corporateId);
    if (!corporate) AppException.notFound({ message: 'Corporate not found' });

    const effectiveFrom = dto.effectiveFrom
      ? this.toDateOnly(dto.effectiveFrom)
      : moment().format('YYYY-MM-DD');
    const ts = this.now();

    const plan = await CorporateBillingPlan.transaction(async (trx) => {
      // Deactivate existing active plans
      await CorporateBillingPlan.query(trx)
        .patch({ isActive: false, updatedAt: ts } as any)
        .where('corporateId', corporateId)
        .where('isActive', true);

      return CorporateBillingPlan.query(trx).insertAndFetch({
        corporateId,
        pricePerVehicle,
        effectiveFrom,
        isActive: true,
        notes: dto.notes || null,
        createdAt: ts,
        updatedAt: ts,
      } as any);
    });
    return this.formatPlanDates(plan.toJSON ? plan.toJSON() : plan);
  }

  // ─── Invoice generation ────────────────────────────────────────────────────

  async generateInvoice(dto: GenerateCorporateInvoiceDto, performedBy: number | null = null) {
    const corporateId = Number(dto.corporateId);
    const periodStart = dto.periodStart;
    const periodEnd = dto.periodEnd;
    const notes = dto.notes || null;
    const discountAmount = parseFloat(String(dto.discount ?? 0)) || 0;

    if (!corporateId || !periodStart || !periodEnd) {
      AppException.badRequest({ message: 'corporateId, periodStart, and periodEnd are required' });
    }

    const corporate: any = await Corporate.query().findById(corporateId);
    if (!corporate) AppException.notFound({ message: 'Corporate not found' });

    // Duplicate guard — one invoice per corporate per billing period
    const existing: any = await CorporateInvoice.query()
      .select('id', 'invoiceNumber', 'status')
      .where({ corporateId, billingPeriodStart: periodStart, billingPeriodEnd: periodEnd })
      .first();
    if (existing) {
      AppException.conflict({
        message: `Invoice already exists for this period (${existing.invoiceNumber}, status: ${existing.status})`,
      });
    }

    const plans: any[] = await this.getBillingPlansUpTo(corporateId, periodEnd);
    if (!plans.length) AppException.badRequest({ message: 'No active billing plan for corporate' });

    const vehicles = await this.getBillableVehicles(corporateId);
    const vehicleCount = vehicles.length;
    const pricePerVehicle = parseFloat(plans[0].pricePerVehicle);

    const { subtotal, billingBreakdown } = this.computeSegments(plans, periodStart, periodEnd, vehicleCount);
    const taxRate = this.getTaxRate();
    const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
    const currentCharges = subtotal - discountAmount + taxAmount;

    // Carry forward arrears from partially-paid previous invoices
    const partiallyPaid: any[] = await CorporateInvoice.query()
      .select('totalAmount', 'paidAmount')
      .where({ corporateId, status: 'partially_paid' });
    const arrears = partiallyPaid.reduce(
      (sum, inv) => sum + (parseFloat(inv.totalAmount) - parseFloat(inv.paidAmount)),
      0,
    );
    const totalAmount = currentCharges + arrears;

    const invoiceDate = moment().format('YYYY-MM-DD');
    const dueDate = moment(invoiceDate, 'YYYY-MM-DD').add(30, 'days').format('YYYY-MM-DD');
    const discountPercentage =
      subtotal > 0 ? Math.min(100, this.round2((discountAmount / subtotal) * 100)) : 0;
    const ts = this.now();

    const invoice: any = await CorporateInvoice.transaction(async (trx) => {
      const invoiceNumber = await this.generateInvoiceNumber(corporateId, periodStart, trx);
      const created: any = await CorporateInvoice.query(trx).insertAndFetch({
        invoiceNumber,
        corporateId,
        billingPlanId: plans[plans.length - 1].id,
        billingPeriodStart: periodStart,
        billingPeriodEnd: periodEnd,
        invoiceDate,
        dueDate,
        invoiceMonth: moment(periodStart, 'YYYY-MM-DD').format('YYYY-MM'),
        unitType: 'vehicle',
        unitPrice: this.round2(pricePerVehicle),
        quantity: vehicleCount,
        billableVehicleCount: vehicleCount,
        subtotal: this.round2(subtotal),
        discountPercentage,
        discountAmount: this.round2(discountAmount),
        salesTaxPercentage: taxRate,
        salesTaxAmount: this.round2(taxAmount),
        whTaxPercentage: 0,
        whTaxAmount: 0,
        totalAmount: this.round2(totalAmount),
        arrears: this.round2(arrears),
        paidAmount: 0,
        status: 'draft',
        vehicleSnapshot: vehicles,
        notes,
        billingBreakdown,
        createdAt: ts,
        updatedAt: ts,
      } as any);

      await this.logInvoiceAction(
        created.id,
        'created',
        { billingBreakdown, newStatus: 'draft', performedBy },
        trx,
      );

      // Transition draft -> issued
      await CorporateInvoice.query(trx)
        .findById(created.id)
        .patch({ status: 'issued', pdfPath: null, updatedAt: this.now() } as any);
      await this.logInvoiceAction(
        created.id,
        'issued',
        { billingBreakdown, previousStatus: 'draft', newStatus: 'issued', performedBy },
        trx,
      );
      return { ...created, status: 'issued', pdfPath: null };
    });

    // PDF + email run in the background (legacy awaited them but swallowed their errors).
    this.generatePdfAndEmail(invoice, corporate, { pricePerVehicle, taxRate, billingBreakdown, performedBy }).catch(
      (err) => this.logger.error(`[CorporateFinance] post-generate task failed: ${err?.message}`),
    );

    return this.withListComputed({ ...invoice, pricePerVehicle, taxRate });
  }

  private async generatePdfAndEmail(
    invoice: any,
    corporate: any,
    { pricePerVehicle, taxRate, billingBreakdown, performedBy }: any,
  ) {
    let pdfUrl: string | null = null;
    if (this.corporatesService) {
      try {
        const pdf = await this.corporatesService.generateInvoicePdf(invoice.id);
        pdfUrl = pdf?.url || null;
        await this.logInvoiceAction(invoice.id, 'pdf_generated', { billingBreakdown, performedBy });
      } catch (err) {
        this.logger.error(`[CorporateFinance] PDF generation failed: ${err?.message}`);
      }
    }

    try {
      const sent = await this.sendInvoiceEmail(
        { ...this.formatInvoiceDates(invoice), pricePerVehicle, taxRate, taxAmount: invoice.salesTaxAmount },
        corporate,
        pdfUrl,
      );
      if (sent) {
        await this.logInvoiceAction(invoice.id, 'email_sent', {
          billingBreakdown,
          performedBy,
          meta: { to: corporate.email },
        });
      }
    } catch (err) {
      this.logger.error(`[CorporateFinance] Email failed: ${err?.message}`);
    }
  }

  private buildCorporateInvoiceTemplate(corporate: any, invoice: any) {
    const name = corporate.name || 'Corporate';
    const f = (v: any) => (parseFloat(v) || 0).toFixed(2);
    const balance = ((parseFloat(invoice.totalAmount) || 0) - (parseFloat(invoice.paidAmount) || 0)).toFixed(2);
    const subject = `Invoice ${invoice.invoiceNumber} – PKR ${f(invoice.totalAmount)} due on ${invoice.dueDate}`;
    const text = [
      `Dear ${name},`,
      '',
      `Please find your invoice for the billing period ${invoice.billingPeriodStart} to ${invoice.billingPeriodEnd}.`,
      '',
      `Invoice Number   : ${invoice.invoiceNumber}`,
      `Invoice Date     : ${invoice.invoiceDate}`,
      `Due Date         : ${invoice.dueDate || 'N/A'}`,
      `Billable Vehicles: ${invoice.billableVehicleCount}`,
      `Rate per Vehicle : PKR ${f(invoice.pricePerVehicle)}`,
      `Subtotal         : PKR ${f(invoice.subtotal)}`,
      `Tax (${invoice.taxRate}%)     : PKR ${f(invoice.taxAmount)}`,
      `Total            : PKR ${f(invoice.totalAmount)}`,
      `Amount Paid      : PKR ${f(invoice.paidAmount)}`,
      `Balance Due      : PKR ${balance}`,
      '',
      'Please settle the balance by the due date.',
      '',
      'Regards,',
      'Parking Management System',
    ].join('\n');
    const td = 'padding:8px;border-bottom:1px solid #eee';
    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #ddd;border-radius:8px;overflow:hidden">
      <div style="background:#1a3c5e;color:#fff;padding:24px">
        <h2 style="margin:0">Invoice</h2>
        <p style="margin:4px 0 0">${invoice.invoiceNumber}</p>
      </div>
      <div style="padding:24px">
        <p>Dear <strong>${name}</strong>,</p>
        <p>Please find your invoice for the billing period <strong>${invoice.billingPeriodStart}</strong> to <strong>${invoice.billingPeriodEnd}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="${td};color:#555">Invoice Date</td><td style="${td}">${invoice.invoiceDate}</td></tr>
          <tr><td style="${td};color:#555">Due Date</td><td style="${td}">${invoice.dueDate || 'N/A'}</td></tr>
          <tr><td style="${td};color:#555">Billable Vehicles</td><td style="${td}">${invoice.billableVehicleCount}</td></tr>
          <tr><td style="${td};color:#555">Rate per Vehicle</td><td style="${td}">PKR ${f(invoice.pricePerVehicle)}</td></tr>
          <tr><td style="${td};color:#555">Subtotal</td><td style="${td}">PKR ${f(invoice.subtotal)}</td></tr>
          <tr><td style="${td};color:#555">Tax (${invoice.taxRate}%)</td><td style="${td}">PKR ${f(invoice.taxAmount)}</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">Total</td><td style="padding:8px;font-weight:bold">PKR ${f(invoice.totalAmount)}</td></tr>
          <tr><td style="padding:8px;color:#555">Amount Paid</td><td style="padding:8px">PKR ${f(invoice.paidAmount)}</td></tr>
          <tr style="background:#fff3cd"><td style="padding:8px;font-weight:bold;color:#856404">Balance Due</td><td style="padding:8px;font-weight:bold;color:#856404">PKR ${balance}</td></tr>
        </table>
        <p style="color:#555;font-size:13px">Please settle the balance before the due date. If you have already made the payment, please disregard this email.</p>
      </div>
      <div style="background:#f5f5f5;padding:12px 24px;font-size:12px;color:#888;text-align:center">
        Parking Management System
      </div>
    </div>`;
    return { subject, text, html };
  }

  /** Returns true when an email was handed to the SMTP transport. */
  private async sendInvoiceEmail(invoice: any, corporate: any, pdfUrl: string | null): Promise<boolean> {
    if (!corporate?.email || !this.mailerService) return false;
    const { subject, text, html } = this.buildCorporateInvoiceTemplate(corporate, invoice);
    const fromUser = process.env.MAIL_USERNAME || 'noreply@immensecode.ai';
    await this.mailerService.sendMail({
      from: `"PMS" <${fromUser}>`,
      to: corporate.email,
      subject,
      text,
      html,
      ...(pdfUrl
        ? {
            attachments: [
              { filename: `${invoice.invoiceNumber}.pdf`, path: pdfUrl, contentType: 'application/pdf' },
            ],
          }
        : {}),
    });
    return true;
  }

  // ─── Queries ───────────────────────────────────────────────────────────────

  private parsePaging(query: any = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const pageSize = Math.max(1, parseInt(query.pageSize ?? query.limit, 10) || 20);
    return { page, pageSize };
  }

  async getAllInvoices(
    query: any = {},
    forcedStatuses?: string[],
  ) {
    const { page, pageSize } = this.parsePaging(query);
    const q = CorporateInvoice.query()
      .withGraphFetched('invoiceCorporate(corpFields)')
      .modifiers({ corpFields: (b: any) => b.select('id', 'name', 'email') })
      .orderBy('createdAt', 'desc')
      .orderBy('id', 'desc');

    const status = forcedStatuses || query.status;
    if (status) {
      const list = Array.isArray(status)
        ? status
        : String(status).split(',').map((s) => s.trim()).filter(Boolean);
      if (list.length) q.whereIn('status', list);
    }
    if (query.corporateId) q.where('corporateId', parseInt(query.corporateId, 10));
    if (query.periodStart) q.where('billingPeriodStart', '>=', query.periodStart);
    if (query.periodEnd) q.where('billingPeriodEnd', '<=', query.periodEnd);

    const result: any = await q.page(page - 1, pageSize);
    const total = Number(result.total || 0);
    return {
      results: (result.results || []).map((r: any) => this.withListComputed(r)),
      total,
      page,
      pageSize,
      meta: {
        totalItems: total,
        itemsPerPage: pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
        currentPage: page,
      },
    };
  }

  async getPendingInvoices(query: any = {}) {
    return this.getAllInvoices(query, UNPAID_STATUSES);
  }

  async getInvoiceById(id: number) {
    const invoice: any = await CorporateInvoice.query()
      .findById(id)
      .withGraphFetched('[invoiceCorporate, payments, logs]');
    if (!invoice) AppException.notFound({ message: 'Invoice not found' });

    const raw = this.formatInvoiceDates(invoice.toJSON ? invoice.toJSON() : invoice);
    const subtotal = parseFloat(raw.subtotal) || 0;
    const discount = parseFloat(raw.discountAmount) || 0;
    const taxAmount = this.invoiceTaxAmount(raw);
    const taxRate = this.invoiceTaxRate(raw);
    const totalAmount = parseFloat(raw.totalAmount) || 0;
    const arrears = parseFloat(raw.arrears) || 0;
    const discountPercent = subtotal > 0 ? ((discount / subtotal) * 100).toFixed(2) : '0.00';

    const corp = raw.invoiceCorporate;
    const invoiceCorporate = corp
      ? {
          id: corp.id,
          name: corp.name,
          email: corp.email,
          billingAddress: corp.location || null,
          taxId: corp.registrationNumber || null,
          contactPersonName: corp.contactPersonName || null,
          contactNumber: corp.contactNumber || null,
        }
      : null;

    const lineItems =
      Array.isArray(raw.billingBreakdown) && raw.billingBreakdown.length
        ? raw.billingBreakdown
        : [
            {
              planName: 'Monthly Vehicle Parking',
              vehicleCount: raw.billableVehicleCount,
              pricePerVehicle: parseFloat(raw.unitPrice) || 0,
              lineTotal: subtotal,
            },
          ];

    const vehicleNumbers = Array.isArray(raw.vehicleSnapshot) ? raw.vehicleSnapshot : [];

    return {
      ...raw,
      payments: (raw.payments || []).map((p: any) => this.formatPaymentDates(p)),
      invoiceCorporate,
      lineItems,
      vehicleNumbers,
      subtotal,
      discount,
      discountPercent,
      taxAmount,
      taxRate,
      taxPercent: taxRate,
      arrears,
      totalAmount,
      paymentTerms: 'Net 30',
    };
  }

  async getPaymentsByInvoice(invoiceId: number) {
    const rows: any[] = await CorporateInvoicePayment.query()
      .where('invoiceId', invoiceId)
      .orderBy('createdAt', 'desc')
      .orderBy('id', 'desc');
    return rows.map((p) => this.formatPaymentDates(p.toJSON ? p.toJSON() : p));
  }

  // ─── Dashboard ─────────────────────────────────────────────────────────────

  async getDashboardStats() {
    const today = moment();
    const monthStart = today.clone().startOf('month').format('YYYY-MM-DD');
    const monthEnd = today.clone().endOf('month').format('YYYY-MM-DD');
    const yearStart = today.clone().startOf('year').format('YYYY-MM-DD');
    const yearEnd = today.clone().endOf('year').format('YYYY-MM-DD');
    const knex = CorporateInvoice.knex();

    const [counts]: any = await knex.raw(
      `SELECT
         COUNT(*) AS totalInvoices,
         SUM(status IN (${PAID_STATUSES.map(() => '?').join(',')})) AS paidInvoices,
         SUM(status IN (${UNPAID_STATUSES.map(() => '?').join(',')})) AS pendingInvoices,
         SUM(totalAmount) AS totalBilled,
         SUM(paidAmount) AS totalPaidAmount,
         SUM(CASE WHEN invoiceDate BETWEEN ? AND ? THEN totalAmount ELSE 0 END) AS monthlyRevenue,
         SUM(CASE WHEN invoiceDate BETWEEN ? AND ? THEN totalAmount ELSE 0 END) AS yearlyRevenue
       FROM corporate_invoices`,
      [...PAID_STATUSES, ...UNPAID_STATUSES, monthStart, monthEnd, yearStart, yearEnd],
    );
    const row = counts?.[0] || {};

    const companies: any = await Corporate.query().where('status', 'approved').resultSize();

    const totalBilled = parseFloat(row.totalBilled) || 0;
    const totalPaidAmount = parseFloat(row.totalPaidAmount) || 0;
    return {
      totalInvoices: Number(row.totalInvoices) || 0,
      paidInvoices: Number(row.paidInvoices) || 0,
      pendingInvoices: Number(row.pendingInvoices) || 0,
      totalCompanies: Number(companies) || 0,
      totalPaidAmount,
      totalPendingAmount: this.round2(totalBilled - totalPaidAmount),
      monthlyRevenue: parseFloat(row.monthlyRevenue) || 0,
      yearlyRevenue: parseFloat(row.yearlyRevenue) || 0,
    };
  }

  /**
   * Approved corporates that have a billing plan effective by periodEnd but NO invoice for the period,
   * with an estimated amount (legacy getPendingGenerationCorporates).
   */
  async getUnbilledCorporates(query: any = {}) {
    const { page, pageSize } = this.parsePaging(query);
    const pStart = query.periodStart;
    const pEnd = query.periodEnd;
    if (!pStart || !pEnd) AppException.badRequest({ message: 'periodStart and periodEnd are required' });

    const invoicedRows: any[] = await CorporateInvoice.query()
      .select('corporateId')
      .where({ billingPeriodStart: pStart, billingPeriodEnd: pEnd });
    const invoicedIds = invoicedRows.map((r) => r.corporateId);

    const plansQ = CorporateBillingPlan.query()
      .select('corporate_billing_plans.*')
      .join('corporates', 'corporates.id', 'corporate_billing_plans.corporateId')
      .where('corporates.status', 'approved')
      .where('corporate_billing_plans.effectiveFrom', '<=', pEnd)
      .withGraphFetched('billingPlanCorporate(corpFields)')
      .modifiers({ corpFields: (b: any) => b.select('id', 'name', 'email') })
      .orderBy('corporate_billing_plans.corporateId', 'asc')
      .orderBy('corporate_billing_plans.effectiveFrom', 'asc');
    if (invoicedIds.length) plansQ.whereNotIn('corporate_billing_plans.corporateId', invoicedIds);
    const plans: any[] = await plansQ;

    const plansByCorporate = new Map<number, any[]>();
    for (const plan of plans) {
      if (!plansByCorporate.has(plan.corporateId)) plansByCorporate.set(plan.corporateId, []);
      plansByCorporate.get(plan.corporateId)!.push(plan);
    }

    const taxRate = this.getTaxRate();
    const rows: any[] = [];
    for (const [corporateId, corporatePlans] of plansByCorporate) {
      const corp = corporatePlans[0].billingPlanCorporate || {};
      const vehicles = await this.getBillableVehicles(corporateId);
      const { subtotal } = this.computeSegments(corporatePlans, pStart, pEnd, vehicles.length);
      const taxAmount = (subtotal * taxRate) / 100;
      const totalAmount = subtotal + taxAmount;
      rows.push({
        corporateId: corp.id ?? corporateId,
        corporateName: corp.name,
        corporateEmail: corp.email,
        billingPlanId: corporatePlans[corporatePlans.length - 1].id,
        billingPeriodStart: pStart,
        billingPeriodEnd: pEnd,
        billableVehicleCount: vehicles.length,
        subtotal: this.round2(subtotal),
        discount: 0,
        taxRate,
        taxAmount: this.round2(taxAmount),
        totalAmount: this.round2(totalAmount),
        status: 'not_generated',
      });
    }

    const total = rows.length;
    const offset = (page - 1) * pageSize;
    return {
      results: rows.slice(offset, offset + pageSize),
      total,
      page,
      pageSize,
      periodStart: pStart,
      periodEnd: pEnd,
    };
  }

  // ─── Payment approval ──────────────────────────────────────────────────────

  async approvePayment(invoiceId: number, paymentId: number, performedBy: number | null = null) {
    return CorporateInvoice.transaction(async (trx) => {
      const invoice: any = await CorporateInvoice.query(trx).findById(invoiceId);
      if (!invoice) AppException.notFound({ message: 'Invoice not found' });
      const payment: any = await CorporateInvoicePayment.query(trx)
        .where({ id: paymentId, invoiceId })
        .first();
      if (!payment) AppException.notFound({ message: 'Payment not found' });

      const previousStatus = invoice.status;
      const ts = this.now();
      await CorporateInvoicePayment.query(trx)
        .findById(paymentId)
        .patch({ paymentStatus: 'approved', updatedAt: ts } as any);
      await CorporateInvoice.query(trx)
        .findById(invoiceId)
        .patch({ status: 'paid', paidAmount: invoice.totalAmount, updatedAt: ts } as any);
      await this.logInvoiceAction(
        invoiceId,
        'payment_approved',
        { previousStatus, newStatus: 'paid', performedBy, meta: { paymentId: String(paymentId) } },
        trx,
      );
      return { invoiceId: String(invoiceId), paymentId: String(paymentId), status: 'paid' };
    });
  }

  async declinePayment(
    invoiceId: number,
    paymentId: number,
    reason: string | null = null,
    performedBy: number | null = null,
  ) {
    return CorporateInvoice.transaction(async (trx) => {
      const invoice: any = await CorporateInvoice.query(trx).findById(invoiceId);
      if (!invoice) AppException.notFound({ message: 'Invoice not found' });
      const payment: any = await CorporateInvoicePayment.query(trx)
        .where({ id: paymentId, invoiceId })
        .first();
      if (!payment) AppException.notFound({ message: 'Payment not found' });

      const previousStatus = invoice.status;
      const ts = this.now();
      await CorporateInvoicePayment.query(trx)
        .findById(paymentId)
        .patch({ paymentStatus: 'declined', declineReason: reason || null, updatedAt: ts } as any);
      await CorporateInvoice.query(trx)
        .findById(invoiceId)
        .patch({ status: 'declined', updatedAt: ts } as any);
      await this.logInvoiceAction(
        invoiceId,
        'payment_declined',
        { previousStatus, newStatus: 'declined', performedBy, meta: { paymentId: String(paymentId), reason } },
        trx,
      );
      return { invoiceId: String(invoiceId), paymentId: String(paymentId), status: 'declined', reason };
    });
  }

  // ─── Delete ────────────────────────────────────────────────────────────────

  async deleteInvoice(invoiceId: number) {
    const invoice: any = await CorporateInvoice.query().findById(invoiceId);
    if (!invoice) AppException.notFound({ message: 'Invoice not found' });
    if (!DELETABLE_STATUSES.includes(invoice.status)) {
      AppException.badRequest({
        message: `Invoice cannot be deleted in '${invoice.status}' status. Only draft, issued, pending, or declined invoices can be deleted.`,
      });
    }
    await CorporateInvoice.transaction(async (trx) => {
      await CorporateInvoicePayment.query(trx).delete().where('invoiceId', invoiceId);
      // corporate_invoice_logs rows are removed by FK ON DELETE CASCADE
      await CorporateInvoice.query(trx).deleteById(invoiceId);
    });
    return { invoiceId: String(invoiceId), deleted: true };
  }

  // ─── Receipt download ──────────────────────────────────────────────────────

  /**
   * Streams the payment receipt file. Legacy did `res.download(<chat-backend>/uploads/payment-receipts/<receiptFile>)`.
   * Lookup order:
   *  1. receiptUrl is an absolute http(s) URL -> proxy it
   *  2. local dir CORPORATE_PAYMENT_RECEIPTS_DIR (default <cwd>/public/uploads/payment-receipts)
   *  3. legacy server: LEGACY_UPLOADS_BASE_URL (default https://api.smartparkings.com.pk) + receiptUrl
   */
  async downloadPaymentReceipt(invoiceId: number, paymentId: number, res: Response) {
    const payment: any = await CorporateInvoicePayment.query()
      .where({ id: paymentId, invoiceId })
      .first();
    if (!payment) AppException.notFound({ message: 'Payment not found' });
    if (!payment.receiptFile) AppException.notFound({ message: 'No receipt file attached to this payment' });

    const fileName: string = payment.receiptFile;
    const receiptUrl: string = payment.receiptUrl || `/uploads/payment-receipts/${fileName}`;

    if (/^https?:\/\//i.test(receiptUrl)) {
      return this.proxyRemoteFile(receiptUrl, fileName, res);
    }

    const localDir =
      process.env.CORPORATE_PAYMENT_RECEIPTS_DIR ||
      path.join(process.cwd(), 'public', 'uploads', 'payment-receipts');
    const localPath = path.join(localDir, path.basename(fileName));
    if (fs.existsSync(localPath)) {
      await new Promise<void>((resolve, reject) =>
        res.download(localPath, fileName, (err) => (err ? reject(err) : resolve())),
      );
      return;
    }

    const legacyBase = (process.env.LEGACY_UPLOADS_BASE_URL || 'https://api.smartparkings.com.pk').replace(/\/+$/, '');
    const relative = receiptUrl.startsWith('/') ? receiptUrl : `/${receiptUrl}`;
    const encoded = relative.split('/').map((seg) => encodeURIComponent(seg)).join('/');
    return this.proxyRemoteFile(`${legacyBase}${encoded}`, fileName, res);
  }

  private async proxyRemoteFile(url: string, fileName: string, res: Response) {
    let upstream: any;
    try {
      upstream = await axios.get(url, { responseType: 'stream', timeout: 30000 });
    } catch (err) {
      AppException.notFound({ message: 'Receipt file not found on disk' });
    }
    const ext = path.extname(fileName).toLowerCase();
    const contentType =
      upstream.headers['content-type'] || MIME_BY_EXT[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    if (upstream.headers['content-length']) res.setHeader('Content-Length', upstream.headers['content-length']);
    res.attachment(fileName); // Content-Disposition: attachment; filename="<receiptFile>"
    await new Promise<void>((resolve, reject) => {
      upstream.data.on('error', reject);
      res.on('finish', resolve);
      res.on('close', resolve);
      upstream.data.pipe(res);
    });
  }
}

const MIME_BY_EXT: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml',
};
