import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { AppConfigService } from 'src/core/config/app-config.service';
import { AppException } from 'src/core/exception/app-exception';
import { GlobalHelper } from 'src/core/helper/global-helper';
import { ParkingSite } from 'src/core/orm/entities/parking-site.entity';
import { Operator } from 'src/core/orm/entities/operator.entity';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { OperatorPaginatedDto } from './dto/operator-paginated.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';

@Injectable()
export class OperatorsService {
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

  // 1. GET AVAILABLE PASSWORDS
  async getPasswords() {
    const usedOperators = await Operator.query()
      .select('password')
      .whereNotNull('password');
    const usedSet = new Set(usedOperators.map((o) => String(o.password)));

    const candidates: string[] = [];
    for (let i = 1000; i <= 9999; i++) {
      const pin = String(i);
      if (!usedSet.has(pin)) {
        candidates.push(pin);
      }
    }

    if (!candidates.length) {
      AppException.badRequest({ message: 'No available passwords found.' });
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }

  // 2. CREATE
  async create(dto: CreateOperatorDto) {
    const item = await Operator.query().insertAndFetch({
      site_id: dto.site_id,
      supervisor_id: dto.supervisor_id,
      username: dto.username,
      mobile: dto.mobile,
      email: dto.email,
      cnic: dto.cnic,
      password: dto.password,
      profile_image: dto.profile_image,
    });
    return item;
  }

  private getOperatorsFilterQuery(dto: OperatorPaginatedDto = {}) {
    const query = Operator.query();

    if (dto.site_id !== undefined && dto.site_id !== null) {
      query.where('site_id', dto.site_id);
    }

    if (dto.supervisor_id !== undefined && dto.supervisor_id !== null) {
      query.where('supervisor_id', dto.supervisor_id);
    }

    if (dto.status) {
      query.where('status', dto.status);
    }

    if (dto.search_text) {
      const search = `%${dto.search_text}%`;
      query.where((builder) => {
        builder
          .where('username', 'like', search)
          .orWhere('mobile', 'like', search)
          .orWhere('email', 'like', search)
          .orWhere('cnic', 'like', search);
      });
    }

    query.withGraphFetched('[site, supervisor]');
    query.modifyGraph('site', (builder) => {
      builder.select('id', 'name');
    });
    query.orderBy('id', 'desc');

    return query;
  }

  // 3. PAGINATED
  async paginated(data: any = {}) {
    const dto: OperatorPaginatedDto = data.dto || {};
    const query = this.getOperatorsFilterQuery(dto);

    return await Operator.pagination(query, data);
  }

  // 4. READ BY ID
  async findOne(id: number) {
    const item = await Operator.query()
      .findById(id)
      .withGraphFetched('[site, supervisor]')
      .modifyGraph('site', (builder) => {
        builder.select('id', 'name');
      });

    if (!item) {
      AppException.notFound({ message: 'Operator not found' });
    }
    return item;
  }

  // 5. UPDATE
  async update(dto: UpdateOperatorDto, authId?: number) {
    await this.findOne(dto.id);
    const updated = await Operator.query().patchAndFetchById(dto.id, {
      site_id: dto.site_id,
      supervisor_id: dto.supervisor_id,
      username: dto.username,
      mobile: dto.mobile,
      email: dto.email,
      cnic: dto.cnic,
      password: dto.password,
      profile_image: dto.profile_image,
      status: dto.status,
    });
    return updated;
  }

  // 6. DELETE
  async delete(id: number) {
    await this.findOne(id);
    await Operator.query().deleteById(id);
    return true;
  }

  // 7. EXPORT EXCEL
  async exportExcel(dto: OperatorPaginatedDto = {}): Promise<string> {
    const operators: any[] = await this.getOperatorsFilterQuery(dto);

    // Resolve filters summary
    const filters: { label: string; value: string | number }[] = [];
    if (dto.search_text) filters.push({ label: 'Search', value: dto.search_text });
    if (dto.site_id) {
      const siteRecord = await ParkingSite.query().findById(dto.site_id).select('name');
      filters.push({ label: 'Site', value: (siteRecord as any)?.name || dto.site_id });
    }
    if (dto.status) filters.push({ label: 'Status', value: dto.status });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Operators');

    const headers = [
      { key: 'row_number', name: '#', width: 6, align: 'center' },
      { key: 'username', name: 'Username', width: 20, align: 'left' },
      { key: 'mobile', name: 'Mobile #', width: 16, align: 'center' },
      { key: 'email', name: 'Email Address', width: 26, align: 'left' },
      { key: 'cnic', name: 'CNIC', width: 20, align: 'center' },
      { key: 'site_name', name: 'Site Name', width: 24, align: 'left' },
      { key: 'supervisor_name', name: 'Supervisor', width: 20, align: 'left' },
      { key: 'password', name: 'PIN / Password', width: 16, align: 'center' },
      { key: 'status', name: 'Status', width: 14, align: 'center' },
      { key: 'created_at', name: 'Created At', width: 20, align: 'center' },
    ];

    const totalColumns = headers.length;
    const lastColLetter = String.fromCharCode(65 + totalColumns - 1);
    const reportDate = GlobalHelper.getDateTime();

    // Row 1: Metadata
    const metaRow = worksheet.addRow([`Generated At: ${reportDate}`, `Total Records: ${operators.length}`]);
    metaRow.font = { italic: true, size: 9, color: { argb: '555555' } };

    // Row 2: Title
    const titleRow = worksheet.addRow(['Operators Directory Report']);
    worksheet.mergeCells(`A2:${lastColLetter}2`);
    const titleCell = worksheet.getCell('A2');
    titleCell.font = { bold: true, size: 14, color: { argb: '1447B1' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleRow.height = 28;

    // Filters block if any
    let currentRowIdx = 3;
    if (filters.length > 0) {
      const filterStr = filters.map((f) => `${f.label}: ${f.value}`).join('  |  ');
      const filterRow = worksheet.addRow([`Applied Filters: ${filterStr}`]);
      worksheet.mergeCells(`A${currentRowIdx}:${lastColLetter}${currentRowIdx}`);
      const fCell = worksheet.getCell(`A${currentRowIdx}`);
      fCell.font = { italic: true, size: 9, color: { argb: '333333' } };
      fCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F1F5F9' },
      };
      currentRowIdx++;
    }

    worksheet.addRow([]); // Blank line
    currentRowIdx++;

    // Table Header Row
    const headerValues = headers.map((h) => h.name);
    const headerRow = worksheet.addRow(headerValues);
    headerRow.height = 22;

    headerRow.eachCell((cell, colNum) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0F172A' },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 10 };
      cell.alignment = {
        vertical: 'middle',
        horizontal: (headers[colNum - 1]?.align as any) || 'left',
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'CBD5E1' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
      };
    });

    // Populate Data
    operators.forEach((op: any, index: number) => {
      const rowData = [
        index + 1,
        op.username || '-',
        op.mobile || '-',
        op.email || '-',
        op.cnic || '-',
        op?.site?.name || '-',
        op?.supervisor?.username || op?.supervisor?.name || '-',
        op.password || '-',
        op.status || 'active',
        GlobalHelper.formatDateTime(op.created_at),
      ];

      const r = worksheet.addRow(rowData);
      r.height = 19;

      const isEven = index % 2 === 0;
      r.eachCell((cell, colNum) => {
        cell.font = { size: 9, color: { argb: '1E293B' } };
        cell.alignment = {
          vertical: 'middle',
          horizontal: (headers[colNum - 1]?.align as any) || 'left',
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
        };
        if (isEven) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F8FAFC' },
          };
        }
      });
    });

    // Set Column Widths
    headers.forEach((h, idx) => {
      worksheet.getColumn(idx + 1).width = h.width;
    });

    const buffer: any = await workbook.xlsx.writeBuffer();
    const fileKey = `report/operators-${Date.now()}.xlsx`;

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

  // 8. EXPORT PDF
  async exportPdf(dto: OperatorPaginatedDto = {}): Promise<string> {
    const operatorsRaw: any[] = await this.getOperatorsFilterQuery(dto);

    // Resolve filters summary
    const filters: { label: string; value: string | number }[] = [];
    if (dto.search_text) filters.push({ label: 'Search', value: dto.search_text });
    if (dto.site_id) {
      const siteRecord = await ParkingSite.query().findById(dto.site_id).select('name');
      filters.push({ label: 'Site', value: (siteRecord as any)?.name || dto.site_id });
    }
    if (dto.status) filters.push({ label: 'Status', value: dto.status });

    let activeCount = 0;
    let inactiveCount = 0;

    const operators = operatorsRaw.map((op: any, index: number) => {
      const status = String(op.status || 'active').toLowerCase();
      if (status === 'active') activeCount++;
      else inactiveCount++;

      return {
        row_number: index + 1,
        username: op.username || '-',
        mobile: op.mobile || '-',
        email: op.email || '-',
        cnic: op.cnic || '-',
        site_name: op?.site?.name || '-',
        supervisor_name: op?.supervisor?.username || op?.supervisor?.name || '-',
        password: op.password || '-',
        status: op.status || 'active',
        status_class: status === 'active' ? 'badge-active' : 'badge-inactive',
        created_at: GlobalHelper.formatDate(op.created_at) || '-',
      };
    });

    const html = await this.renderHtmlTemplate(
      'operators/operators-report.html',
      {
        generated_at: GlobalHelper.getDateTime(),
        total_records: operators.length,
        active_records: activeCount,
        inactive_records: inactiveCount,
        has_filters: filters.length > 0,
        filters,
        operators,
      },
    );

    const pdfBuffer = await this.htmlToPdfBuffer(html, true);
    const fileKey = `report/operators-${Date.now()}.pdf`;

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
        margin: {
          top: '8mm',
          right: '8mm',
          bottom: '8mm',
          left: '8mm',
        },
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
