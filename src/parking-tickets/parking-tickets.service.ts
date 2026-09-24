import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
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
