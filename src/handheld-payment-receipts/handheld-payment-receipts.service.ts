import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import moment from 'moment';
import * as path from 'path';
import { AppException } from 'src/core/exception/app-exception';
import {
  HandheldPaymentMethodIdMap,
  VehicleTypeIdMap,
} from 'src/core/helper/enum/global.enum';
import { ParkingReceipt } from 'src/core/orm/entities/parking-receipt.entity';
import { FilesUploadService } from 'src/files-upload/files-upload.service';
import { Readable } from 'stream';
import {
  AddHandheldReceiptDto,
  TicketEaseDto,
} from './dto/add-handheld-receipt.dto';

@Injectable()
export class HandheldPaymentReceiptsService {
  private readonly logger = new Logger(HandheldPaymentReceiptsService.name);
  private readonly logFilePath = path.join(process.cwd(), 'handheld_logs.log');

  constructor(private readonly filesUploadService: FilesUploadService) {}

  private appendLog(message: string): void {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const logEntry = `[${timestamp}] ${message}\n`;
    try {
      fs.appendFileSync(this.logFilePath, logEntry, 'utf8');
    } catch (err) {
      this.logger.error(`Failed to write to log file: ${err.message}`);
    }
  }

  private getCellValue(cell: ExcelJS.Cell): any {
    const val = cell.value;
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      if (val instanceof Date) return val;
      if ('result' in val) return (val as any).result ?? '';
      if ('text' in val) return (val as any).text ?? '';
      if ('richText' in val && Array.isArray((val as any).richText)) {
        return (val as any).richText.map((t: any) => t.text).join('');
      }
    }
    return val;
  }

  private cleanString(val: any): string {
    if (val === null || val === undefined) return '';
    return String(val).trim();
  }

  private parseDateTime(val: any): string | null {
    if (!val) return null;
    if (val instanceof Date) {
      return moment(val).format('YYYY-MM-DD HH:mm:ss');
    }
    if (typeof val === 'number') {
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      return moment(date).format('YYYY-MM-DD HH:mm:ss');
    }
    const str = String(val).trim();
    if (!str) return null;
    const m = moment(
      str,
      [
        'YYYY-MM-DD HH:mm:ss.SSS',
        'YYYY-MM-DD HH:mm:ss',
        'YYYY-MM-DDTHH:mm:ss.SSSZ',
        'YYYY-MM-DDTHH:mm:ss',
        'DD-MM-YYYY HH:mm:ss',
        'DD/MM/YYYY HH:mm:ss',
        'YYYY/MM/DD HH:mm:ss',
        moment.ISO_8601,
      ],
      true,
    );
    if (m.isValid()) {
      return m.format('YYYY-MM-DD HH:mm:ss');
    }
    const fallback = moment(str);
    return fallback.isValid() ? fallback.format('YYYY-MM-DD HH:mm:ss') : null;
  }

  private resolveVehicleType(type: any): number | null {
    if (!type && type !== 0) return null;
    const s = String(type).trim().toLowerCase();
    if (s === 'car' || s === '1') return 1;
    if (s === 'bus' || s === '3') return 3;
    if (s === 'bike' || s === '4') return 4;
    if (s === 'van' || s === '5') return 5;
    return null;
  }

  private resolvePaymentMethod(method: any): { isValid: boolean; id: number | null } {
    if (method === null || method === undefined || String(method).trim() === '') {
      return { isValid: false, id: null };
    }
    const s = String(method).trim().toLowerCase();
    if (s === 'skip' || s === 'unpaid') {
      return { isValid: true, id: null };
    }
    if (s === 'cash' || s === '16') {
      return { isValid: true, id: 16 };
    }
    if (s === 'pos' || s === '15') {
      return { isValid: true, id: 15 };
    }
    if (s === 'foc' || s === 'free car' || s === '14') {
      return { isValid: true, id: 14 };
    }
    if (s === 'online' || s === '18') {
      return { isValid: true, id: 18 };
    }
    if (
      s === 'scratch card' ||
      s === 'scratchcard' ||
      s === 'scratch_card' ||
      s === '6'
    ) {
      return { isValid: true, id: 6 };
    }
    return { isValid: false, id: null };
  }

  private validateOnlinePaymentReference(paymentMethodNameOrId: any, onlineRef: any): boolean {
    const isOnline =
      String(paymentMethodNameOrId).trim().toLowerCase() === 'online' ||
      paymentMethodNameOrId === 18;
    if (isOnline) {
      return !!(onlineRef && String(onlineRef).trim().length > 0);
    }
    return true;
  }

  private compareTicketData(
    dbRecord: any,
    row: any,
    fieldsToCompare: string[],
  ): string[] {
    const diffs: string[] = [];

    if (
      fieldsToCompare.includes('vehicleNumber') &&
      this.cleanString(dbRecord.vehicleNumber).toLowerCase() !==
        this.cleanString(row.vehicleNumber).toLowerCase()
    ) {
      diffs.push('vehicleNumber');
    }

    if (
      fieldsToCompare.includes('deviceId') &&
      this.cleanString(dbRecord.deviceId).toLowerCase() !==
        this.cleanString(row.deviceId).toLowerCase()
    ) {
      diffs.push('deviceId');
    }

    if (
      fieldsToCompare.includes('vehicleType') &&
      Number(dbRecord.vehicleType) !== Number(row.vehicleType)
    ) {
      diffs.push('vehicleType');
    }

    if (fieldsToCompare.includes('creationDate')) {
      const dbDate = this.parseDateTime(dbRecord.creationDate);
      const rowDate = this.parseDateTime(row.creationDate);
      if (dbDate && rowDate && dbDate !== rowDate) {
        diffs.push('creationDate');
      }
    }

    if (fieldsToCompare.includes('paymentMethod')) {
      const dbMethod = dbRecord.paymentMethod ?? null;
      const rowMethod = row.paymentMethod ?? null;
      if (dbMethod !== rowMethod) {
        diffs.push('paymentMethod');
      }
    }

    return diffs;
  }

  async batch(file: any) {
    if (!file || !file.buffer) {
      AppException.badRequest({ message: 'Invalid or missing CSV file' });
    }

    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.csv.read(Readable.from(file.buffer));
    } catch (error) {
      AppException.badRequest({
        message: 'Invalid CSV file. Unable to parse file.',
      });
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet || worksheet.rowCount <= 1) {
      AppException.badRequest({ message: 'CSV file is empty' });
    }

    // Map header names (first row) to column numbers
    const col: Record<string, number> = {};
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      col[this.cleanString(cell.value)] = colNumber;
    });

    const requiredColumns = [
      'ticketNumber',
      'vehicleNumber',
      'deviceId',
      'vehicleType',
      'paymentMethod',
      'creationDate',
      'siteId',
    ];
    const missingColumns = requiredColumns.filter((c) => !col[c]);
    if (missingColumns.length > 0) {
      AppException.badRequest({
        message: `Missing columns: [${missingColumns.join(', ')}]`,
      });
    }

    const get = (row: ExcelJS.Row, name: string) =>
      col[name] ? this.getCellValue(row.getCell(col[name])) : '';

    const errors: Array<{ row: number; ticketNumber?: string; error: string }> =
      [];
    const rows: any[] = [];

    for (let r = 2; r <= worksheet.rowCount; r++) {
      const row = worksheet.getRow(r);
      const ticketNumber = this.cleanString(get(row, 'ticketNumber'));
      const vehicleNumber = this.cleanString(get(row, 'vehicleNumber'));
      const deviceId = this.cleanString(get(row, 'deviceId'));
      const rawVehicleType = this.cleanString(get(row, 'vehicleType'));
      const rawPaymentMethod = this.cleanString(get(row, 'paymentMethod'));
      const rawCreationDate = get(row, 'creationDate');
      const onlinePaymentReference = this.cleanString(
        get(row, 'onlinePaymentReference'),
      );
      const rawSiteId = this.cleanString(get(row, 'siteId'));

      // Skip empty rows
      if (!ticketNumber && !vehicleNumber && !deviceId) continue;

      const fail = (error: string) => {
        this.appendLog(`${ticketNumber} ${error}`);
        errors.push({ row: r, ticketNumber, error });
      };

      if (!ticketNumber || !vehicleNumber || !deviceId) {
        fail('Invalid data: ticketNumber, vehicleNumber and deviceId are required');
        continue;
      }

      if (!rawSiteId || isNaN(Number(rawSiteId))) {
        fail(`Invalid or missing siteId: ${rawSiteId}`);
        continue;
      }
      const siteId = Number(rawSiteId);

      const vehicleType = this.resolveVehicleType(rawVehicleType);
      if (vehicleType === null) {
        fail(`Invalid Vehicle Type: ${rawVehicleType}`);
        continue;
      }

      const payment = this.resolvePaymentMethod(rawPaymentMethod);
      if (!payment.isValid) {
        fail(`Invalid Payment Method: ${rawPaymentMethod}`);
        continue;
      }

      const creationDate = this.parseDateTime(rawCreationDate);
      if (!creationDate) {
        fail(`Invalid Creation Date: ${rawCreationDate}`);
        continue;
      }

      rows.push({
        rowNumber: r,
        ticketNumber,
        vehicleNumber,
        deviceId,
        vehicleType,
        paymentMethod: payment.id,
        creationDate,
        onlinePaymentReference: onlinePaymentReference || null,
        siteId,
      });
    }

    // Skip tickets that already exist in DB
    const existing = new Set<string>();
    const ticketNumbers = rows.map((r) => r.ticketNumber);
    for (let i = 0; i < ticketNumbers.length; i += 1000) {
      const found = await ParkingReceipt.query()
        .whereIn('ticketNumber', ticketNumbers.slice(i, i + 1000))
        .select('ticketNumber');
      found.forEach((f) => existing.add(this.cleanString(f.ticketNumber)));
    }

    const toInsert: any[] = [];
    let skipped = 0;
    for (const row of rows) {
      if (existing.has(row.ticketNumber)) {
        skipped++;
        continue;
      }
      existing.add(row.ticketNumber); // duplicate rows in same file
      toInsert.push({
        ticketNumber: row.ticketNumber,
        vehicleNumber: row.vehicleNumber,
        deviceId: row.deviceId,
        vehicleType: row.vehicleType,
        paymentMethod: row.paymentMethod,
        creationDate: row.creationDate,
        onlinePaymentReference: row.onlinePaymentReference,
        siteId: row.siteId,
        sourceHandheld: 1,
        uploadDate: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log(toInsert ,'toInsert')

    if (toInsert.length > 0) {
      // knex batchInsert: chunks of 500, all inside one transaction
      await ParkingReceipt.knex().batchInsert(
        ParkingReceipt.tableName,
        toInsert,
        500,
      );
    }

    return {
      inserted: toInsert.length,
      skipped,
      errored: errors.length,
      message: `${toInsert.length} Record(s) inserted, ${skipped} Record(s) already exist and ${errors.length} Record(s) errored`,
      errors: errors.slice(0, 100),
    };
  }

  async checkOutBatch(file: any) {
    if (!file || !file.buffer) {
      AppException.badRequest({ message: 'Invalid or missing CSV file' });
    }

    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.csv.read(Readable.from(file.buffer));
    } catch {
      AppException.badRequest({
        message: 'Invalid CSV file. Unable to parse file.',
      });
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet || worksheet.rowCount <= 1) {
      AppException.badRequest({ message: 'CSV file is empty' });
    }

    const col: Record<string, number> = {};
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      col[this.cleanString(cell.value)] = colNumber;
    });

    const requiredColumns = [
      'ticketNumber',
      'vehicleNumber',
      'deviceId',
      'vehicleType',
      'paymentMethod',
      'creationDate',
      'checkoutDateTime',
      'siteId',
    ];
    const missingColumns = requiredColumns.filter((c) => !col[c]);
    if (missingColumns.length > 0) {
      AppException.badRequest({
        message: `Missing columns: [${missingColumns.join(', ')}]`,
      });
    }

    const get = (row: ExcelJS.Row, name: string) =>
      col[name] ? this.getCellValue(row.getCell(col[name])) : '';

    const errors: Array<{ row: number; ticketNumber?: string; error: string }> =
      [];
    const rows: any[] = [];

    for (let r = 2; r <= worksheet.rowCount; r++) {
      const row = worksheet.getRow(r);
      const ticketNumber = this.cleanString(get(row, 'ticketNumber'));
      const vehicleNumber = this.cleanString(get(row, 'vehicleNumber'));
      const deviceId = this.cleanString(get(row, 'deviceId'));
      const rawVehicleType = this.cleanString(get(row, 'vehicleType'));
      const rawPaymentMethod = this.cleanString(get(row, 'paymentMethod'));
      const rawCreationDate = get(row, 'creationDate');
      const rawCheckoutDateTime = get(row, 'checkoutDateTime');
      const paymentReference = this.cleanString(get(row, 'paymentReference'));
      const onlinePaymentReference = this.cleanString(
        get(row, 'onlinePaymentReference'),
      );
      const rawSiteId = this.cleanString(get(row, 'siteId'));

      if (!ticketNumber && !vehicleNumber && !deviceId) continue;

      const fail = (error: string) => {
        this.appendLog(`[ticketEase] ${ticketNumber} ${error}`);
        errors.push({ row: r, ticketNumber, error });
      };

      if (!ticketNumber || !vehicleNumber || !deviceId) {
        fail('ticketNumber, vehicleNumber and deviceId are required');
        continue;
      }

      if (!rawSiteId || isNaN(Number(rawSiteId))) {
        fail(`Invalid or missing siteId: ${rawSiteId}`);
        continue;
      }
      const siteId = Number(rawSiteId);

      const vehicleType = this.resolveVehicleType(rawVehicleType);
      if (vehicleType === null) {
        fail(`Invalid Vehicle Type: ${rawVehicleType}`);
        continue;
      }

      const payment = this.resolvePaymentMethod(rawPaymentMethod);
      if (!payment.isValid) {
        fail(`Invalid Payment Method: ${rawPaymentMethod}`);
        continue;
      }

      const creationDate = this.parseDateTime(rawCreationDate);
      if (!creationDate) {
        fail(`Invalid Creation Date: ${rawCreationDate}`);
        continue;
      }

      const checkoutDateTime = this.parseDateTime(rawCheckoutDateTime);
      if (!checkoutDateTime) {
        fail(`Invalid Checkout Date Time: ${rawCheckoutDateTime}`);
        continue;
      }

      if (payment.id === 18 && !onlinePaymentReference) {
        fail('onlinePaymentReference is required for online payment');
        continue;
      }

      rows.push({
        rowNumber: r,
        ticketNumber,
        vehicleNumber,
        deviceId,
        vehicleType,
        paymentMethod: payment.id,
        creationDate,
        checkoutDateTime,
        paymentReference: paymentReference || null,
        onlinePaymentReference: onlinePaymentReference || null,
        siteId,
      });
    }

    // Lookup existing tickets in DB
    const existingMap = new Map<string, any>();
    const ticketNumbers = rows.map((r) => r.ticketNumber);
    for (let i = 0; i < ticketNumbers.length; i += 1000) {
      const found = await ParkingReceipt.query()
        .whereIn('ticketNumber', ticketNumbers.slice(i, i + 1000))
        .select(
          'id',
          'ticketNumber',
          'vehicleNumber',
          'deviceId',
          'vehicleType',
          'siteId',
        );
      found.forEach((f) => existingMap.set(this.cleanString(f.ticketNumber), f));
    }

    const toInsert: any[] = [];
    const toUpdate: Array<{ id: number; patch: any }> = [];
    const seen = new Set<string>();

    for (const row of rows) {
      if (seen.has(row.ticketNumber)) continue;
      seen.add(row.ticketNumber);

      const existing = existingMap.get(row.ticketNumber);
      if (existing) {
        const mismatch =
          this.cleanString(existing.vehicleNumber).toLowerCase() !==
            row.vehicleNumber.toLowerCase() ||
          this.cleanString(existing.deviceId).toLowerCase() !==
            row.deviceId.toLowerCase() ||
          Number(existing.vehicleType) !== Number(row.vehicleType);

        if (mismatch) {
          this.appendLog(`[ticketEase] Mismatch for ticket ${row.ticketNumber}`);
          errors.push({
            row: row.rowNumber,
            ticketNumber: row.ticketNumber,
            error: 'Vehicle or device data mismatch with DB',
          });
          continue;
        }

        toUpdate.push({
          id: existing.id,
          patch: {
            sourceTicketEase: 1,
            checkoutDateTime: row.checkoutDateTime,
            paymentMethod: row.paymentMethod,
            paymentReference: row.paymentReference,
            onlinePaymentReference: row.onlinePaymentReference,
            siteId: row.siteId || existing.siteId,
            updatedAt: new Date(),
          },
        });
      } else {
        toInsert.push({
          ticketNumber: row.ticketNumber,
          vehicleNumber: row.vehicleNumber,
          deviceId: row.deviceId,
          vehicleType: row.vehicleType,
          paymentMethod: row.paymentMethod,
          creationDate: row.creationDate,
          checkoutDateTime: row.checkoutDateTime,
          sourceTicketEase: 1,
          paymentReference: row.paymentReference,
          onlinePaymentReference: row.onlinePaymentReference,
          siteId: row.siteId,
          uploadDate: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    if (toInsert.length > 0 || toUpdate.length > 0) {
      const knex = ParkingReceipt.knex();
      await knex.transaction(async (trx) => {
        if (toInsert.length > 0) {
          await trx.batchInsert(ParkingReceipt.tableName, toInsert, 500);
        }
        for (const u of toUpdate) {
          await trx(ParkingReceipt.tableName).where('id', u.id).update(u.patch);
        }
      });
    }

    return {
      inserted: toInsert.length,
      updated: toUpdate.length,
      errored: errors.length,
      message: `${toInsert.length} Record(s) inserted, ${toUpdate.length} Record(s) updated and ${errors.length} Record(s) errored`,
      errors: errors.slice(0, 100),
    };
  }

  async UploadedFile(file: any) {
    return this.batch(file);
  }

  async ticketCheckout(files: any, dto: TicketEaseDto) {
    const findOne = await ParkingReceipt.query()
      .whereRaw('LOWER(TRIM(ticketNumber)) = LOWER(?)', [dto.ticketNumber])
      .first();
    if (!findOne) {
      AppException.badRequest({ message: 'Ticket Number not found' });
    }
    let onlinePaymentReferenceUrl = null;
    const proofFiles =
      files?.onlinePaymentReference ||
      (Array.isArray(files) ? files : null);

    if (proofFiles && (Array.isArray(proofFiles) ? proofFiles.length > 0 : true)) {
      const uploadResults = await this.filesUploadService.uploadFile(
        Array.isArray(proofFiles) ? proofFiles : [proofFiles],
        { destination: 'online-payment-proofs' } as any,
      );
      if (uploadResults && uploadResults.length > 0) {
        onlinePaymentReferenceUrl = uploadResults[0];
      }
    }

    await ParkingReceipt.query().updateAndFetchById(findOne.id, {
      sourceTicketEase: 1,
      checkoutDateTime: dto.checkoutDateTime,
      vehicleNumber: dto.vehicleNumber,
      deviceId: dto.deviceId,
      vehicleType: VehicleTypeIdMap[dto.vehicleType],
      paymentMethod: dto.paymentMethod
        ? (HandheldPaymentMethodIdMap[dto.paymentMethod] ?? null)
        : null,
      creationDate: dto.creationDate,
      ticketNumber: dto.ticketNumber,
      sourceHandheld: 1,
      paymentReference: dto.paymentReference ?? null,
      onlinePaymentReference: onlinePaymentReferenceUrl,
    });
    return true;
  }

  async add(files: any, dto: AddHandheldReceiptDto) {
    let onlinePaymentReferenceUrl = null;

    const proofFiles =
      files?.onlinePaymentReference ||
      (Array.isArray(files) ? files : null);

    if (proofFiles && (Array.isArray(proofFiles) ? proofFiles.length > 0 : true)) {
      const uploadResults = await this.filesUploadService.uploadFile(
        Array.isArray(proofFiles) ? proofFiles : [proofFiles],
        { destination: 'online-payment-proofs' } as any,
      );
      if (uploadResults && uploadResults.length > 0) {
        onlinePaymentReferenceUrl = uploadResults[0];
      }
    }
    let findOne = await ParkingReceipt.query().insertAndFetch({
      vehicleNumber: dto.vehicleNumber,
      deviceId: dto.deviceId,
      vehicleType: VehicleTypeIdMap[dto.vehicleType],
      paymentMethod: dto.paymentMethod
        ? (HandheldPaymentMethodIdMap[dto.paymentMethod] ?? null)
        : null,
      creationDate: dto.creationDate,
      ticketNumber: dto.ticketNumber,
      sourceHandheld: 1,
      checkoutDateTime: null,
      paymentReference: dto.paymentReference ?? null,
      onlinePaymentReference: onlinePaymentReferenceUrl,
      siteId: dto.siteId ?? null,
    } as any);

    return findOne;
  }
}

