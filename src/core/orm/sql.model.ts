import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import knex from 'knex';
import { Model, QueryBuilder } from 'objection';
import { LodashHelper } from '../helper/lodash-helper';

dotenv.config();

const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    timezone: 'Z',
  },
  pool: {
    min: 2,
    max: 10,
  },
});

Model.knex(db);

// Custom Query Builder to keep the logic clean and chainable
export class CustomQueryBuilder<M extends Model, R = M[]> extends QueryBuilder<
  M,
  R
> {
  // Use simple type definitions to avoid deep recursion in TS
  SingleQueryBuilderType!: CustomQueryBuilder<M, M>;
  MaybeSingleQueryBuilderType!: CustomQueryBuilder<M, M | undefined>;

  async pagination(req: any = {}) {
    const params = req.query || {};
    const request = req.req || {};
    const baseUrl = (process.env.BASE_URL || '') + (request.route?.path || '');

    const perPage = params.limit ? Number(params.limit) : 10;
    const currentPage = params.page ? Number(params.page) - 1 : 0;

    const data: any = await this.page(currentPage, perPage);
    const totalPages = Math.ceil(data.total / perPage);

    const pageNum = params.page ? Number(params.page) : 1;
    const previous = pageNum > 1 ? pageNum - 1 : null;
    const next = pageNum < totalPages ? pageNum + 1 : null;

    data.page = pageNum;
    data.meta = {
      totalItems: data.total,
      itemsPerPage: perPage,
      totalPages: totalPages,
      currentPage: pageNum,
    };

    data.links = {
      first: `${baseUrl}/?page=1&limit=${perPage}`,
      previous: previous
        ? `${baseUrl}/?page=${previous}&limit=${perPage}`
        : null,
      next: next ? `${baseUrl}/?page=${next}&limit=${perPage}` : null,
      last: `${baseUrl}/?page=${totalPages}&limit=${perPage}`,
    };

    return data;
  }

  async findOneCustom(): Promise<M | null> {
    const data = await (this as any).first();
    return (data as M) || null;
  }

  async findAllCustom(): Promise<M[]> {
    const data = await (this as any);
    return Array.isArray(data) ? (data as M[]) : [];
  }
}

@Injectable()
export class Mapping extends Model {
  static table: string;
  QueryBuilderType!: CustomQueryBuilder<this, this[]>;
  static QueryBuilder = CustomQueryBuilder;

  static get tableName() {
    return this.table || this.name.toLowerCase();
  }

  // Simplified static wrappers to maintain backward compatibility
  static query() {
    return super.query() as CustomQueryBuilder<any>;
  }

  static async pagination(query: any, req: any = {}) {
    return query.pagination(req);
  }

  static async findOneCustom(query: any) {
    return query.findOneCustom();
  }

  static async findAllCustom(query: any) {
    return query.findAllCustom();
  }

  static getAuthId(builder: any): number | undefined {
    return builder.context().authId;
  }

  static authFilter(builder: any, column: string = 'user_id') {
    const authId = this.getAuthId(builder);
    if (authId) {
      builder.where(column, authId);
    }
    return builder;
  }

  static async upsert({ whereClause, data }: { whereClause: any; data: any }) {
    const existing: any = await this.query().where(whereClause).first();
    if (existing) {
      return this.query().patchAndFetchById(existing.id, data);
    } else {
      return this.query().insertAndFetch(data);
    }
  }

  static rawQuery(sql: string, bindings?: any) {
    return this.knex().raw(sql, bindings);
  }

  static getPaginationParams(req: any = {}) {
    const pageVal = Number(
      LodashHelper.get(
        req,
        'query.page',
        LodashHelper.get(req, 'dto.page', req?.page),
      ),
    );
    const limitVal = Number(
      LodashHelper.get(
        req,
        'query.limit',
        LodashHelper.get(
          req,
          'dto.limit',
          LodashHelper.get(req, 'dto.resultsPerPage', req?.limit),
        ),
      ),
    );

    const currentPage = Number.isInteger(pageVal) && pageVal > 0 ? pageVal : 1;
    const perPage = Number.isInteger(limitVal) && limitVal > 0 ? limitVal : 10;

    return { currentPage, perPage, page: currentPage, limit: perPage };
  }

  static paginationResponse(data: any = {}, req: any = {}) {
    const { currentPage, perPage } = this.getPaginationParams(req);
    const routePath = LodashHelper.get(req, 'req.route.path', '');
    const baseUrl = (process.env.BASE_URL || '') + routePath;

    const results = Array.isArray(data.results) ? data.results : [];
    const total = Number(data.total || 0);
    const totalPages = Math.ceil(total / perPage);

    const extraData = LodashHelper.omit(data, [
      'results',
      'total',
      'page',
      'meta',
      'links',
    ]);

    return {
      ...extraData,
      results,
      total,
      page: currentPage,
      meta: {
        itemCount: results.length,
        totalItems: total,
        itemsPerPage: perPage,
        totalPages,
        currentPage,
      },
      links: {
        first: `${baseUrl}/?page=1&limit=${perPage}`,
        previous:
          currentPage > 1
            ? `${baseUrl}/?page=${currentPage - 1}&limit=${perPage}`
            : null,
        next:
          currentPage < totalPages
            ? `${baseUrl}/?page=${currentPage + 1}&limit=${perPage}`
            : null,
        last:
          totalPages > 0
            ? `${baseUrl}/?page=${totalPages}&limit=${perPage}`
            : null,
      },
    };
  }
}

