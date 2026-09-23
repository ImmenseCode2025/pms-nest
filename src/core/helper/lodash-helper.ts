import {
  sumBy,
  groupBy,
  keyBy,
  uniqBy,
  orderBy,
  pick,
  omit,
  get,
  flatten,
  isPlainObject,
} from 'lodash';

export class LodashHelper {
  static sumBy<T>(
    array: T[],
    iteratee: keyof T | ((item: T) => number),
  ): number {
    return sumBy(array, iteratee as any) || 0;
  }

  static groupBy<T>(
    array: T[],
    iteratee: keyof T | ((item: T) => any),
  ): Record<string, T[]> {
    return groupBy(array, iteratee as any);
  }

  static keyBy<T>(
    array: T[],
    iteratee: keyof T | ((item: T) => any),
  ): Record<string, T> {
    return keyBy(array, iteratee as any);
  }

  static uniqBy<T>(
    array: T[],
    iteratee: keyof T | ((item: T) => any),
  ): T[] {
    return uniqBy(array, iteratee as any);
  }

  static orderBy<T>(
    array: T[],
    iteratees: any,
    orders?: ('asc' | 'desc')[],
  ): T[] {
    return orderBy(array, iteratees, orders);
  }

  static pick<T extends object>(object: T, paths: string[]): Partial<T> {
    return pick(object, paths);
  }

  static omit<T extends object>(object: T, paths: string[]): Partial<T> {
    return omit(object, paths);
  }

  static get<T = any>(object: any, path: string | string[], defaultValue?: T): T {
    return get(object, path, defaultValue);
  }

  static flatten<T>(array: any[]): T[] {
    return flatten(array);
  }

  static isPlainObject(value: any): boolean {
    return isPlainObject(value);
  }
}
