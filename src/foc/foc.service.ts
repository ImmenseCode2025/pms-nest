import { Injectable } from '@nestjs/common';
import { AppException } from 'src/core/exception/app-exception';
import { GlobalHelper } from 'src/core/helper/global-helper';
import { FOC, FocQrCode } from 'src/core/orm/entities';
import { CreateFocDto } from './dto/create-foc.dto';
import { FocListDto } from './dto/foc-list.dto';
import { FocPaginatedDto } from './dto/foc-paginated.dto';

const FOC_COMPANY_ID = 7;
// Karachi (KMC) parking sites belong to this company
const KMC_SITE_COMPANY_ID = 7;

// Served by ServeStaticModule at /public/uploads/foc/<file>
export const FOC_UPLOAD_DIR = './public/uploads/foc';

@Injectable()
export class FocService {
  async paginated(data: any = {}) {
    const dto: FocPaginatedDto = data.dto || {};
    const query = FOC.query().where('foc_card.company', FOC_COMPANY_ID);

    if (dto.site_id) {
      query.where('foc_card.site', dto.site_id);
    }

    if (dto.search_text) {
      const search = `%${dto.search_text.trim()}%`;
      query.where((builder) => {
        builder
          .where('foc_card.employeeName', 'like', search)
          .orWhere('foc_card.employeeId', 'like', search);
      });
    }

    query.withGraphFetched('[focParkingSites, focCompanies, focDesignations]');
    query.modifyGraph('focParkingSites', (builder) => builder.select('id', 'name'));
    query.modifyGraph('focCompanies', (builder) => builder.select('id', 'name'));
    query.modifyGraph('focDesignations', (builder) => builder.select('id', 'name'));
    query.orderBy('foc_card.id', 'desc');

    return await FOC.pagination(query, data);
  }

  // ─── FOC CARDS LIST (Karachi sites) ──────────────────────────────────────────

  async list(data: any = {}) {
    const dto: FocListDto = data.dto || {};
    const knex = FOC.knex();

    const query = FOC.query()
      .select(
        'foc_card.*',
        // Separate alias: a duplicate 'dateJoining' breaks the pagination count query
        knex.raw("DATE_FORMAT(foc_card.dateJoining, '%Y-%m-%d') as dateJoiningFormatted"),
      )
      .innerJoin('parking_site as ps', 'ps.id', 'foc_card.site')
      .leftJoin('company as c', 'c.id', 'foc_card.company')
      .leftJoin('designation as d', 'd.id', 'foc_card.designation')
      .where('ps.company', KMC_SITE_COMPANY_ID);

    const search = dto.search?.trim();
    if (search) {
      const like = `%${search}%`;
      query.where((builder) => {
        builder
          .where('foc_card.employeeName', 'like', like)
          .orWhere('foc_card.employeeId', 'like', like)
          .orWhereRaw("DATE_FORMAT(foc_card.dateJoining, '%Y-%m-%d') LIKE ?", [like])
          .orWhere('ps.name', 'like', like)
          .orWhere('c.name', 'like', like)
          .orWhere('d.name', 'like', like)
          .orWhereRaw(
            "CONCAT(TIME_FORMAT(foc_card.shiftTimeFrom, '%l:%i%p'), ' - ', TIME_FORMAT(foc_card.shiftTimeTo, '%l:%i%p')) LIKE ?",
            [like],
          );
      });
    }

    query.withGraphFetched('[focParkingSites, focCompanies, focDesignations]');
    query.modifyGraph('focParkingSites', (builder) => builder.select('id', 'name'));
    query.modifyGraph('focCompanies', (builder) => builder.select('id', 'name'));
    query.modifyGraph('focDesignations', (builder) => builder.select('id', 'name'));
    query.orderBy('foc_card.updatedAt', 'desc');

    const result: any = await FOC.pagination(query, data);
    result.results = (result.results || []).map(
      ({ dateJoiningFormatted, ...row }: any) => ({
        ...row,
        dateJoining: dateJoiningFormatted,
        profilePic: this.profilePicUrl(row.profile),
      }),
    );
    return result;
  }

  // ─── FOC QR CODES (vehicles) LIST (Karachi sites) ────────────────────────────

  async qrCodes(data: any = {}) {
    const dto: FocListDto = data.dto || {};
    const knex = FocQrCode.knex();

    const query = FocQrCode.query()
      .select(
        'foc_qr_code.*',
        // Stored wall-clock time as 'YYYY-MM-DDTHH:mm:ss' (screen splits on 'T').
        // Separate alias: a duplicate 'createdDateTime' breaks the pagination count query
        knex.raw(
          "DATE_FORMAT(foc_qr_code.createdDateTime, '%Y-%m-%dT%H:%i:%s') as createdDateTimeFormatted",
        ),
      )
      // foc_qr_code.employeeId holds the employee code (foc_card.employeeId), not foc_card.id
      .select('fc.id as focCardId', 'fc.employeeName as focEmployeeName')
      .innerJoin('parking_site as ps', 'ps.id', 'foc_qr_code.site')
      .leftJoin('foc_card as fc', 'fc.employeeId', 'foc_qr_code.employeeId')
      .where('ps.company', KMC_SITE_COMPANY_ID);

    const search = dto.search?.trim();
    if (search) {
      const like = `%${search}%`;
      query.where((builder) => {
        builder
          .where('foc_qr_code.employeeId', 'like', like)
          .orWhere('foc_qr_code.tokenNumber', 'like', like)
          .orWhereRaw(
            "DATE_FORMAT(foc_qr_code.createdDateTime, '%Y-%m-%d %H:%i:%s') LIKE ?",
            [like],
          )
          .orWhere('ps.name', 'like', like)
          .orWhere('fc.employeeName', 'like', like);
      });
    }

    query.withGraphFetched('[focQrParkingSite, focQrHardware]');
    query.modifyGraph('focQrParkingSite', (builder) => builder.select('id', 'name'));
    query.modifyGraph('focQrHardware', (builder) => builder.select('id', 'ipOrApi'));
    query.orderBy('foc_qr_code.createdDateTime', 'desc');

    const result: any = await FocQrCode.pagination(query, data);
    result.results = (result.results || []).map(
      ({ createdDateTimeFormatted, focCardId, focEmployeeName, ...row }: any) => ({
        ...row,
        createdDateTime: createdDateTimeFormatted,
        focCardFOC: focCardId
          ? { id: focCardId, employeeName: focEmployeeName }
          : null,
      }),
    );
    return result;
  }

  // ─── CREATE FOC CARD ─────────────────────────────────────────────────────────

  async create(dto: CreateFocDto, file: any, authId: number) {
    const knex = FOC.knex();
    const employeeId = String(dto.employeeId).trim();

    const exists = await knex('foc_card').where('employeeId', employeeId).first();
    if (exists) {
      AppException.conflict({ message: 'FOC Card for employee already exists.' });
    }

    const now = GlobalHelper.getDateTime('YYYY-MM-DD HH:mm:ss');
    const [id] = await knex('foc_card').insert({
      site: Number(dto.siteName),
      employeeId,
      employeeName: String(dto.employeeName).trim(),
      dateJoining: dto.dateHiring,
      company: Number(dto.company),
      designation: Number(dto.designation),
      shiftTimeFrom: dto.shiftTimeFrom,
      shiftTimeTo: dto.shiftTimeTo,
      profile: file?.filename || null,
      user: authId,
      createdAt: now,
      updatedAt: now,
    });

    const created = await knex('foc_card').where('id', id).first();
    return { ...created, profilePic: this.profilePicUrl(created?.profile) };
  }

  private profilePicUrl(fileName?: string | null) {
    if (!fileName) return null;
    if (/^https?:\/\//i.test(fileName)) return fileName;
    return `${process.env.BASE_URL || ''}/public/uploads/foc/${fileName}`;
  }
}
