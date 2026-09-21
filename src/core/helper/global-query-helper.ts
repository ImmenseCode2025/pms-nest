import { isInteger } from 'lodash';
import moment from 'moment';
import { BasedPaginatedDto } from '../decorators/decorators-dto/based-paginated.dto';
import { DateFilterTypeEnum } from './enum/global.enum';
export class GlobalQueryHelper {
  static applyNumberFilter({
    query,
    column,
    filter,
  }: {
    query: any;
    column: string;
    filter?: BasedPaginatedDto | null;
  }) {
    if (!filter) return;

    // Coerce & validate value
    const v = Number(filter.value as any);
    if (!Number.isFinite(v)) return;

    // Normalize type: "Less than" -> "less_than"
    const t = (filter.filter_type ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');

    switch (t) {
      case 'equal_to':
        query.where(column, v);
        break;
      case 'less_than':
        query.where(column, '<', v);
        break;
      case 'greater_than':
        query.where(column, '>', v);
        break;
      case 'less_than_equal_to':
        query.where(column, '<=', v);
        break;
      case 'greater_than_equal_to':
        query.where(column, '>=', v);
        break;
      default:
        break;
    }
  }

  static applyFilterForNumeric({ query, column, filter }) {
    if (!this.isNumeric(filter.value)) {
      return;
    }

    const searchValue = this.parseNumeric(filter.value);
    query.whereRaw('CAST(?? AS CHAR) LIKE ?', [column, `%${searchValue}%`]);

    if (!filter?.value) return;

    switch (filter.filter_type) {
      case 'equals':
        query.where(column, filter.value);
        break;
      case 'contains':
        query.where(column, 'like', `%${filter.value}%`);
        break;
      case 'one_of':
        query.whereIn(column, filter.value);
        break;
    }
  }

  static applyDateFilter({
    query,
    column,
    filter,
  }: {
    query: any;
    column: string;
    filter?: BasedPaginatedDto | null | any;
  }) {
    if (!filter || this.isEmpty(filter.value)) return;

    // normalize filter type
    const t = this.normType(filter.filter_type);
    if (!t) return;

    // parse value -> moment (UTC)
    let m: moment.Moment | null = null;

    if (typeof filter.value === 'string') {
      // STRICT 'YYYY-MM-DD'
      const parsed = moment.utc(filter.value.trim(), 'YYYY-MM-DD', true);
      if (!parsed.isValid()) return; // invalid date string -> no-op (or throw)
      m = parsed;
    } else if (filter.value instanceof Date) {
      const parsed = moment.utc(filter.value);
      if (!parsed.isValid()) return;
      m = parsed;
    } else {
      // unsupported type
      return;
    }

    const start = m.clone().startOf('day').toDate(); // 00:00:00.000Z
    const end = m.clone().endOf('day').toDate(); // 23:59:59.999Z

    switch (t) {
      case DateFilterTypeEnum.EQUAL_TO:
        query.whereBetween(column, [start, end]);
        break;
      case DateFilterTypeEnum.LESS_THAN:
        query.where(column, '<', start);
        break;
      case DateFilterTypeEnum.GREATER_THAN:
        query.where(column, '>', end);
        break;
      case DateFilterTypeEnum.LESS_THAN_EQUAL_TO:
        query.where(column, '<=', end);
        break;
      case DateFilterTypeEnum.GREATER_THAN_EQUAL_TO:
        query.where(column, '>=', start);
        break;
      default:
        break;
    }
  }

  static applyFilter({ query, column, filter }) {
    if (!filter?.value) return;

    switch (filter.filter_type) {
      case 'equals':
        query.whereRaw(`LOWER(??) = LOWER(?)`, [column, filter.value]);
        break;
      case 'contains':
        query.whereRaw('LOWER(??) LIKE LOWER(?)', [
          column,
          `%${filter.value}%`,
        ]);
        break;
      case 'one_of':
        const values = Array.isArray(filter.value)
          ? filter.value
          : [filter.value];
        query.whereRaw(
          `LOWER(??) IN (${values.map(() => 'LOWER(?)').join(',')})`,
          [column, ...values],
        );
        break;
    }
  }

  static normType = (s?: string | null) =>
    (s ?? '').trim().toLowerCase().replace(/\s+/g, '_');

  static isEmpty = (v: any) =>
    v === null || v === undefined || (typeof v === 'string' && v.trim() === '');

  static isNumeric(value) {
    return isInteger(Number(value));
  }

  static parseNumeric(value) {
    return parseFloat(String(value).replace(/,/g, '').trim()) || 0;
  }
}
