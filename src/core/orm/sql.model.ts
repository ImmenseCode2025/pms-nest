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

  static getPaginationParams(data: any = {}) {
    const params = data?.query || data?.dto || data || {};
    const pageVal = Number(data?.query?.page || data?.dto?.page || params?.page || 1);
    const limitVal = Number(
      data?.query?.limit ||
      data?.query?.resultsPerPage ||
      data?.dto?.resultsPerPage ||
      data?.dto?.limit ||
      params?.resultsPerPage ||
      params?.limit ||
      10,
    );
    const currentPage = Number.isInteger(pageVal) && pageVal > 0 ? pageVal : 1;
    const perPage = Number.isInteger(limitVal) && limitVal > 0 ? limitVal : 10;
    return { currentPage, perPage, page: currentPage, limit: perPage };
  }

  static paginationResponse(data: any = {}, req: any = {}) {
    const { currentPage, perPage } = this.getPaginationParams(req);
    const routePath = LodashHelper.get(req, 'req.route.path', '');
    const baseUrl = `${process.env.BASE_URL || ''}${routePath}`;

    let results: any[] = [];
    let total = 0;

    // Handle MySQL raw multi-result sets: [ [ rows, totalSet, okPacket ], fieldPackets ]
    if (Array.isArray(data?.[0])) {
      const firstSet = data[0][0] ?? data[0];
      results = Array.isArray(firstSet) ? firstSet : [firstSet];

      const secondSet = data[0][1] ?? data[1];
      if (Array.isArray(secondSet) && secondSet.length > 0) {
        const totalObj = secondSet[0];
        total = Number(
          totalObj?.total_count ??
          totalObj?.total ??
          totalObj?.count ??
          Object.values(totalObj || {})[0] ??
          0,
        );
      }
    } else {
      results = LodashHelper.get(data, 'results', data);
      total = Number(data?.total || 0);
    }

    // Unwrap nested arrays if any
    while (
      Array.isArray(results) &&
      results.length > 0 &&
      Array.isArray(results[0])
    ) {
      results = results[0];
    }
    results = Array.isArray(results) ? results : [];

    if (!total) {
      total = Number(
        data?.total ??
        results?.[0]?.total_count ??
        results?.[0]?.total ??
        results.length,
      );
    }

    const totalPages = Math.ceil(total / perPage) || 1;
    const previous = currentPage > 1 ? currentPage - 1 : null;
    const next = currentPage < totalPages ? currentPage + 1 : null;

    const extraData = LodashHelper.isPlainObject(data)
      ? LodashHelper.omit(data, ['results', 'total', 'page', 'meta', 'links'])
      : {};

    return {
      ...extraData,
      results,
      total,
      page: currentPage,
      meta: {
        totalItems: total,
        itemsPerPage: perPage,
        totalPages,
        currentPage,
      },
      links: {
        first: `${baseUrl}/?page=1&limit=${perPage}`,
        previous: previous
          ? `${baseUrl}/?page=${currentPage - 1}&limit=${perPage}`
          : null,
        next: next ? `${baseUrl}/?page=${currentPage + 1}&limit=${perPage}` : null,
        last: `${baseUrl}/?page=${totalPages}&limit=${perPage}`,
      },
    };
  }
}



