import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { AppConfigService } from 'src/core/config/app-config.service';
import { GlobalHelper } from 'src/core/helper/global-helper';
import { LodashHelper } from 'src/core/helper/lodash-helper';
import { ParkingSite, ParkingToken, VehicleType } from 'src/core/orm/entities';
import { ParkingTicketsPaginatedDto } from './dto/parking-tickets-paginated.dto';

type PdfFilterItem = {
  label: string;
  value: string | number;
};

@Injectable()
export class ParkingTicketsService {
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

  async paginated(data: any = {}) {
    const dto: ParkingTicketsPaginatedDto = data.dto || {};
    const { currentPage, perPage } = ParkingToken.getPaginationParams(data);

    const search = dto.search?.trim() || null;
    const siteId = dto.site ? Number(dto.site) : null;
    const vehicleType = dto.vehicleType ? Number(dto.vehicleType) : null;
    const deviceType = dto.deviceType?.trim() || null; // 'system' | 'handheld' | null
    const startDate = dto.startDate?.trim() || null;
    const endDate = dto.endDate?.trim() || null;

    const dbResult: any = await ParkingToken.knex().raw(
      `CALL sp_get_parking_tickets(?, ?, ?, ?, ?, ?, ?, ?)`,
      [currentPage, perPage, search, siteId, vehicleType, deviceType, startDate, endDate],
    );

    return ParkingToken.paginationResponse(dbResult, data);
  }

  async parkingTicketsPdf(dto: ParkingTicketsPaginatedDto = {}): Promise<any> {
    const search = dto.search?.trim() || null;
    const siteId = dto.site ? Number(dto.site) : null;
    const vehicleType = dto.vehicleType ? Number(dto.vehicleType) : null;
    const deviceType = dto.deviceType?.trim() || null;
    const startDate = dto.startDate?.trim() || null;
    const endDate = dto.endDate?.trim() || null;

    const dbResult: any = await ParkingToken.knex().raw(
      `CALL sp_get_parking_tickets_pdf(?, ?, ?, ?, ?, ?)`,
      [search, siteId, vehicleType, deviceType, startDate, endDate],
    );

    const rawRows: any[] = LodashHelper.get(
      dbResult,
      '0.0',
      LodashHelper.get(dbResult, '0', []),
    );
    const cleanRows: any[] = Array.isArray(rawRows) ? rawRows : [];

    const filters: PdfFilterItem[] = [];
    if (search) filters.push({ label: 'Search', value: search });

    if (siteId) {
      let siteName = cleanRows[0]?.site_name;
      if (!siteName) {
        const siteRecord = await ParkingSite.query().findById(siteId).select('name');
        siteName = (siteRecord as any)?.name;
      }
      filters.push({ label: 'Site', value: siteName || siteId });
    }

    if (vehicleType) {
      let vehicleTypeName = cleanRows[0]?.vehicle_type;
      if (!vehicleTypeName) {
        const vtRecord = await VehicleType.query().findById(vehicleType).select('name');
        vehicleTypeName = (vtRecord as any)?.name;
      }
      filters.push({ label: 'Vehicle Type', value: vehicleTypeName || vehicleType });
    }

    if (deviceType) {
      const formattedDevice =
        deviceType.toLowerCase() === 'system'
          ? 'System'
          : deviceType.toLowerCase() === 'handheld'
            ? 'Handheld'
            : deviceType;
      filters.push({ label: 'Device Type', value: formattedDevice });
    }
    if (startDate) filters.push({ label: 'From Date', value: startDate });
    if (endDate) filters.push({ label: 'To Date', value: endDate });

    const totalRevenueSum = LodashHelper.sumBy(cleanRows, (row: any) =>
      Number(row.amount || 0),
    );

    const tickets = LodashHelper.map(cleanRows, (row: any, index: number) => {
      const numAmount = Number(row.amount || 0);

      return {
        row_number: index + 1,
        slip_number: row.slip_number || '-',
        vehicle_number: row.vehicle_number || '-',
        source: row.source || '-',
        source_class: String(row.source || '').toLowerCase().includes('handheld') || String(row.source || '').toLowerCase().includes('ticket')
          ? 'handheld'
          : 'system',
        site_name: row.site_name || '-',
        vehicle_type: row.vehicle_type || '-',
        payment_method: row.payment_method || '-',
        check_in_date_time: GlobalHelper.formatDateTime(row?.check_in_date_time),
        check_out_date_time: GlobalHelper.formatDateTime(row?.check_out_date_time),
        status: row.status || 'Active',
        status_class: String(row.status || '').toLowerCase() === 'active' ? 'active' : 'expired',
        amount: numAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      };
    });

    const html = await this.renderHtmlTemplate(
      'parking-tickets/parking-tickets-report.html',
      {
        generated_at: GlobalHelper.getDateTime(),
        total_records: tickets.length,
        total_revenue: totalRevenueSum.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        has_filters: filters.length > 0,
        filters,
        tickets,
      },
    );

    const pdfBuffer = await this.htmlToPdfBuffer(html, true);
    const fileKey = `report/parking-tickets-${Date.now()}.pdf`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
      }),
    );

    return this.appConfigService.getR2Url(fileKey);
  }

  async parkingTicketsExcel(dto: ParkingTicketsPaginatedDto = {}): Promise<string> {
    const search = dto.search?.trim() || null;
    const siteId = dto.site ? Number(dto.site) : null;
    const vehicleType = dto.vehicleType ? Number(dto.vehicleType) : null;
    const deviceType = dto.deviceType?.trim() || null;
    const startDate = dto.startDate?.trim() || null;
    const endDate = dto.endDate?.trim() || null;

    const dbResult: any = await ParkingToken.knex().raw(
      `CALL sp_get_parking_tickets_pdf(?, ?, ?, ?, ?, ?)`,
      [search, siteId, vehicleType, deviceType, startDate, endDate],
    );

    const rawRows: any[] = LodashHelper.get(
      dbResult,
      '0.0',
      LodashHelper.get(dbResult, '0', []),
    );
    const cleanRows: any[] = Array.isArray(rawRows) ? rawRows : [];

    // Resolve filters summary
    const filters: { label: string; value: string | number }[] = [];
    if (search) filters.push({ label: 'Search', value: search });

    if (siteId) {
      let siteName = cleanRows[0]?.site_name;
      if (!siteName) {
        const siteRecord = await ParkingSite.query().findById(siteId).select('name');
        siteName = (siteRecord as any)?.name;
      }
      filters.push({ label: 'Site', value: siteName || siteId });
    }

    if (vehicleType) {
      let vehicleTypeName = cleanRows[0]?.vehicle_type;
      if (!vehicleTypeName) {
        const vtRecord = await VehicleType.query().findById(vehicleType).select('name');
        vehicleTypeName = (vtRecord as any)?.name;
      }
      filters.push({ label: 'Vehicle Type', value: vehicleTypeName || vehicleType });
    }

    if (deviceType) {
      const formattedDevice =
        deviceType.toLowerCase() === 'system'
          ? 'System'
          : deviceType.toLowerCase() === 'handheld'
            ? 'Handheld'
            : deviceType;
      filters.push({ label: 'Device Type', value: formattedDevice });
    }
    if (startDate) filters.push({ label: 'From Date', value: startDate });
    if (endDate) filters.push({ label: 'To Date', value: endDate });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Parking Tickets');

    const headers = [
      { key: 'row_number', name: '#', width: 8, align: 'center' },
      { key: 'slip_number', name: 'Slip / Token #', width: 18, align: 'center' },
      { key: 'vehicle_number', name: 'Vehicle #', width: 18, align: 'center' },
      { key: 'source', name: 'Source', width: 14, align: 'center' },
      { key: 'site_name', name: 'Site Name', width: 28, align: 'left' },
      { key: 'vehicle_type', name: 'Vehicle Type', width: 18, align: 'center' },
      { key: 'payment_method', name: 'Payment Method', width: 18, align: 'center' },
      { key: 'check_in_date_time', name: 'Check-In Time', width: 22, align: 'center' },
      { key: 'check_out_date_time', name: 'Check-Out Time', width: 22, align: 'center' },
      { key: 'status', name: 'Status', width: 14, align: 'center' },
      { key: 'amount', name: 'Amount (PKR)', width: 16, align: 'right' },
    ];

    const totalColumns = headers.length;
    const lastColLetter = String.fromCharCode(65 + totalColumns - 1);
    const reportDate = GlobalHelper.getDateTime();

    // Row 1: Metadata
    const metaRow = worksheet.addRow([`Generated At: ${reportDate}`, `Total Records: ${cleanRows.length}`]);
    metaRow.font = { italic: true, size: 10, color: { argb: '555555' } };

    // Row 2: Title
    const titleRow = worksheet.addRow(['Parking Tickets Report']);
    worksheet.mergeCells(`A2:${lastColLetter}2`);
    const titleCell = worksheet.getCell('A2');
    titleCell.font = { bold: true, size: 15, color: { argb: '1447B1' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleRow.height = 30;

    // Row 3: Applied Filters (if any)
    if (filters.length > 0) {
      const filterSummary = filters
        .map((f) => `${f.label}: ${f.value}`)
        .join('  |  ');
      worksheet.addRow([`Filters: ${filterSummary}`]);
      worksheet.mergeCells(`A3:${lastColLetter}3`);
      const filterCell = worksheet.getCell('A3');
      filterCell.font = { italic: true, size: 10, color: { argb: '333333' } };
      filterCell.alignment = { horizontal: 'left', vertical: 'middle' };
    }

    worksheet.addRow([]); // Blank spacer row

    // Table Header Row
    const headerRow = worksheet.addRow(headers.map((h) => h.name));
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1447B1' },
      };
      cell.font = { color: { argb: 'FFFFFF' }, bold: true, size: 11 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'CCCCCC' } },
        left: { style: 'thin', color: { argb: 'CCCCCC' } },
        bottom: { style: 'medium', color: { argb: '0E3486' } },
        right: { style: 'thin', color: { argb: 'CCCCCC' } },
      };
    });

    // Set Column Widths
    worksheet.columns = headers.map((h) => ({
      key: h.key,
      width: h.width,
    }));

    // Data Rows
    let totalRevenue = 0;
    cleanRows.forEach((row, index) => {
      const numAmount = Number(row.amount || 0);
      totalRevenue += numAmount;

      const rowValues: Record<string, any> = {
        row_number: index + 1,
        slip_number: row.slip_number || '-',
        vehicle_number: row.vehicle_number || '-',
        source: row.source || '-',
        site_name: row.site_name || '-',
        vehicle_type: row.vehicle_type || '-',
        payment_method: row.payment_method || '-',
        check_in_date_time: GlobalHelper.formatDateTime(row.check_in_date_time),
        check_out_date_time: GlobalHelper.formatDateTime(row.check_out_date_time),
        status: row.status || 'Active',
        amount: numAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      };

      const dataRow = worksheet.addRow(headers.map((h) => rowValues[h.key] ?? '-'));
      dataRow.height = 20;

      const isEven = index % 2 === 0;
      dataRow.eachCell((cell, colNumber) => {
        const headerConfig = headers[colNumber - 1];
        cell.alignment = {
          horizontal: (headerConfig?.align as any) || 'left',
          vertical: 'middle',
        };
        cell.font = { size: 10 };
        cell.border = {
          top: { style: 'thin', color: { argb: 'E0E0E0' } },
          left: { style: 'thin', color: { argb: 'E0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'E0E0E0' } },
          right: { style: 'thin', color: { argb: 'E0E0E0' } },
        };
        if (!isEven) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F9FAFB' },
          };
        }
      });
    });

    // Summary Total Revenue Row
    if (cleanRows.length > 0) {
      const totalRow = worksheet.addRow([
        'Total Revenue',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        totalRevenue.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      ]);
      const totalRowNum = totalRow.number;
      worksheet.mergeCells(`A${totalRowNum}:J${totalRowNum}`);
      totalRow.height = 22;
      const totalLabelCell = worksheet.getCell(`A${totalRowNum}`);
      totalLabelCell.alignment = { horizontal: 'right', vertical: 'middle' };
      totalLabelCell.font = { bold: true, size: 10, color: { argb: '1447B1' } };

      const totalValCell = worksheet.getCell(`K${totalRowNum}`);
      totalValCell.alignment = { horizontal: 'right', vertical: 'middle' };
      totalValCell.font = { bold: true, size: 10, color: { argb: '1447B1' } };

      totalRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'medium', color: { argb: '1447B1' } },
          bottom: { style: 'medium', color: { argb: '1447B1' } },
          left: { style: 'thin', color: { argb: 'CCCCCC' } },
          right: { style: 'thin', color: { argb: 'CCCCCC' } },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'EEF2FF' },
        };
      });
    }

    const buffer: any = await workbook.xlsx.writeBuffer();
    const fileKey = `report/parking-tickets-${Date.now()}.xlsx`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: buffer,
        ContentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    );

    return this.appConfigService.getR2Url(fileKey);
  }

  private async htmlToPdfBuffer(html: string, landscape: boolean = true): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.CHROME_DRIVER_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape,
        printBackground: true,
        margin: landscape
          ? { top: '10mm', bottom: '10mm', left: '8mm', right: '8mm' }
          : { top: '20px', bottom: '20px', left: '20px', right: '20px' },
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
}
