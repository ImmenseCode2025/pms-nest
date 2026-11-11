import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { FERNET_KEY } from 'src/auth/auth.service';
import { AppConfigService } from 'src/core/config/app-config.service';
import { AppException } from 'src/core/exception/app-exception';
import { ExternalApiService } from 'src/core/external-api/external-api.service';
import { GlobalHelper } from 'src/core/helper/global-helper';
import { Address, Users } from 'src/core/orm/entities';
import { ParkingSite } from 'src/core/orm/entities/parking-site.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersDropdownDto } from './dto/users-dropdown.dto';
import { UsersPaginatedDto } from './dto/users-paginated.dto';

const fernet = require('fernet');

@Injectable()
export class UsersService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    private readonly externalApiService: ExternalApiService,
    private readonly appConfigService: AppConfigService,
  ) {
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

  // ─── DROPDOWN ────────────────────────────────────────────────────────────────

  async dropdown(dto: UsersDropdownDto = {}) {
    const query = Users.query()
      .select('id', 'username', 'access')
      .where((builder) => {
        builder.whereNull('isDeleted').orWhere('isDeleted', false);
      })
      .orderBy('username', 'asc');
    if (dto.access) {
      query.where('access', dto.access);
    }
    return await query;
  }

  // ─── GET PROFILE ─────────────────────────────────────────────────────────────

  async getProfile(userId: number) {
    const user = await Users.query()
      .withGraphFetched('[userAddress]')
      .findById(userId);
    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: ['User not found'],
          error: 'Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  // ─── PAGINATED LIST (admin only) ─────────────────────────────────────────────

  async paginated(data: any = {}) {
    const dto: UsersPaginatedDto = data.dto || {};
    const query = this.getUsersFilterQuery(dto);
    return Users.pagination(query, data);
  }

  // Shared by paginated + exports so both always return the same rows
  private getUsersFilterQuery(dto: UsersPaginatedDto = {}) {
    const query = Users.query();

    // Only admin / employee accounts that aren't soft-deleted
    query.whereIn('access', ['admin', 'employee']);
    query.where((builder) => {
      builder.whereNull('isDeleted').orWhere('isDeleted', false);
    });

    if (dto.access) {
      query.where('access', dto.access);
    }

    if (dto.search) {
      const search = `%${dto.search}%`;
      query.where((builder) => {
        builder
          .where('username', 'like', search)
          .orWhere('email', 'like', search)
          .orWhere('contact', 'like', search)
          .orWhere('cnic', 'like', search);
      });
    }

    // Site name for the table (password is stripped by Users.$formatJson)
    query
      .withGraphFetched('parkingSiteUser(siteName)')
      .modifiers({ siteName: (builder) => builder.select('id', 'name') });
    query.orderBy('id', 'desc');

    return query;
  }

  // ─── EXPORT (admin only) ─────────────────────────────────────────────────────

  private getExportFilters(dto: UsersPaginatedDto) {
    const filters: { label: string; value: string }[] = [];
    if (dto.search) filters.push({ label: 'Search', value: dto.search });
    if (dto.access) filters.push({ label: 'User Type', value: this.capitalize(dto.access) });
    return filters;
  }

  private mapExportRow(user: any, index: number) {
    const status = String(user.status || 'incomplete').toLowerCase();
    return {
      row_number: index + 1,
      id: user.id,
      username: user.username || '-',
      email: user.email || '-',
      contact: user.contact || '-',
      cnic: user.cnic || '-',
      access: this.capitalize(user.access) || '-',
      site_name: user?.parkingSiteUser?.name || (user.access === 'admin' ? 'All' : '-'),
      status: this.capitalize(status),
      status_class: status === 'completed' ? 'badge-active' : 'badge-inactive',
      created_at: GlobalHelper.formatDate(user.creationDateTime) || '-',
    };
  }

  async exportExcel(dto: UsersPaginatedDto = {}): Promise<string> {
    const usersRaw: any[] = await this.getUsersFilterQuery(dto);
    const users = usersRaw.map((u, i) => this.mapExportRow(u, i));
    const filters = this.getExportFilters(dto);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    const headers = [
      { key: 'row_number', name: '#', width: 6, align: 'center' },
      { key: 'username', name: 'Name', width: 24, align: 'left' },
      { key: 'email', name: 'Email', width: 30, align: 'left' },
      { key: 'contact', name: 'Contact', width: 18, align: 'center' },
      { key: 'cnic', name: 'CNIC', width: 18, align: 'center' },
      { key: 'access', name: 'User Type', width: 14, align: 'center' },
      { key: 'site_name', name: 'Parking Site', width: 26, align: 'left' },
      { key: 'status', name: 'Status', width: 14, align: 'center' },
      { key: 'created_at', name: 'Created Date', width: 18, align: 'center' },
    ];

    const lastColLetter = String.fromCharCode(65 + headers.length - 1);

    const metaRow = worksheet.addRow([
      `Generated At: ${GlobalHelper.getDateTime()}`,
      `Total Records: ${users.length}`,
    ]);
    metaRow.font = { italic: true, size: 9, color: { argb: '555555' } };

    const titleRow = worksheet.addRow(['Users Report']);
    worksheet.mergeCells(`A2:${lastColLetter}2`);
    const titleCell = worksheet.getCell('A2');
    titleCell.font = { bold: true, size: 14, color: { argb: '1447B1' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleRow.height = 28;

    if (filters.length > 0) {
      const filterStr = filters.map((f) => `${f.label}: ${f.value}`).join('  |  ');
      worksheet.addRow([`Applied Filters: ${filterStr}`]);
      worksheet.mergeCells(`A3:${lastColLetter}3`);
      const fCell = worksheet.getCell('A3');
      fCell.font = { italic: true, size: 9, color: { argb: '333333' } };
      fCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
    }

    worksheet.addRow([]);

    const headerRow = worksheet.addRow(headers.map((h) => h.name));
    headerRow.height = 22;
    headerRow.eachCell((cell, colNum) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
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

    users.forEach((user, index) => {
      const r = worksheet.addRow(headers.map((h) => user[h.key] ?? '-'));
      r.height = 19;
      const isEven = index % 2 === 0;
      r.eachCell((cell, colNum) => {
        cell.font = { size: 9, color: { argb: '1E293B' } };
        cell.alignment = {
          vertical: 'middle',
          horizontal: (headers[colNum - 1]?.align as any) || 'left',
        };
        cell.border = { bottom: { style: 'thin', color: { argb: 'E2E8F0' } } };
        if (isEven) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
        }
      });
    });

    headers.forEach((h, idx) => {
      worksheet.getColumn(idx + 1).width = h.width;
    });

    const buffer: any = await workbook.xlsx.writeBuffer();
    return this.uploadReport(
      buffer,
      `report/users-${Date.now()}.xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
  }

  async exportPdf(dto: UsersPaginatedDto = {}): Promise<string> {
    const usersRaw: any[] = await this.getUsersFilterQuery(dto);
    const users = usersRaw.map((u, i) => this.mapExportRow(u, i));
    const filters = this.getExportFilters(dto);

    const html = await this.renderHtmlTemplate('users/users-report.html', {
      generated_at: GlobalHelper.getDateTime(),
      total_records: users.length,
      admin_records: usersRaw.filter((u) => u.access === 'admin').length,
      employee_records: usersRaw.filter((u) => u.access === 'employee').length,
      has_filters: filters.length > 0,
      filters,
      users,
    });

    const pdfBuffer = await this.htmlToPdfBuffer(html);
    return this.uploadReport(pdfBuffer, `report/users-${Date.now()}.pdf`, 'application/pdf');
  }

  private capitalize(value?: string) {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private async uploadReport(body: any, fileKey: string, contentType: string) {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: body,
        ContentType: contentType,
      }),
    );
    return this.appConfigService.getR2Url(fileKey);
  }

  private async htmlToPdfBuffer(html: string): Promise<Buffer> {
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
        landscape: true,
        printBackground: true,
        margin: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' },
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
    return handlebars.compile(htmlTemplate)(data);
  }

  // ─── CREATE USER (admin only) ────────────────────────────────────────────────

  async create(dto: CreateUserDto) {
    const emailExists = await Users.query().where('email', dto.email).first();
    if (emailExists) {
      AppException.badRequest({ message: 'Email already exists' });
    }

    const cnicExists = await Users.query().where('cnic', dto.cnic).first();
    if (cnicExists) {
      AppException.badRequest({ message: 'CNIC already exists' });
    }

    const site = await ParkingSite.query().findById(dto.site);
    if (!site) {
      AppException.notFound({ message: `Parking site #${dto.site} not found` });
    }

    const payload: Record<string, any> = {
      username: dto.username,
      email: dto.email,
      contact: dto.contact,
      cnic: dto.cnic,
      password: this.encryptPassword(dto.password),
      access: dto.access,
      user_type: dto.access === 'admin' ? 'Admin' : 'User',
      site: dto.site,
      profile: dto.profile,
      location: dto.location,
      latitude: dto.latitude,
      longitude: dto.longitude,
      status: 'completed',
      creationSource: 'manual',
    };

    return Users.query().insertAndFetch(payload);
  }

  // Same Fernet scheme AuthService uses to verify passwords
  private encryptPassword(password: string): string {
    const secret = new fernet.Secret(FERNET_KEY);
    const token = new fernet.Token({ secret, time: Date.now() });
    return token.encode(password);
  }

  // ─── UPDATE PROFILE ───────────────────────────────────────────────────────────

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const patchPayload: Record<string, any> = {
      username: dto.username,
      email: dto.email,
      contact: dto.contact,
      profile: dto.profile,
    };

    if (
      dto?.latitude !== undefined &&
      dto?.latitude !== null &&
      dto?.longitude !== undefined &&
      dto?.longitude !== null
    ) {
      const addressId = await this.resolveAddressId(
        dto.latitude,
        dto.longitude,
      );
      if (addressId) {
        patchPayload.address = addressId;
      }
    }

    return Users.query().patchAndFetchById(userId, patchPayload);
  }

  private async resolveAddressId(
    latitude: number,
    longitude: number,
  ): Promise<number> {
    const existing: any = await Address.query()
      .where('latitude', latitude)
      .where('longitude', longitude)
      .first();

    if (existing) return existing.id;

    // Step 2: reverse-geocode
    const geoData = await this.externalApiService.reverseGeocode(
      latitude,
      longitude,
    );
    const addr = geoData.address ?? {};

    const addressPayload = {
      name: geoData.display_name ?? geoData.name ?? null,
      city:
        addr.city ??
        addr.town ??
        addr.village ??
        addr.municipality ??
        addr.road ??
        null,
      state: addr.state ?? addr.state_district ?? addr.city_district ?? null,
      country: addr.country ?? null,
      zipCode: addr.postcode ?? null,
      latitude,
      longitude,
    };

    const doubleCheck: any = await Address.query()
      .where('latitude', latitude)
      .where('longitude', longitude)
      .first();
    if (doubleCheck) return doubleCheck.id;

    const newAddress: any =
      await Address.query().insertAndFetch(addressPayload);
    return newAddress?.id;
  }
}
