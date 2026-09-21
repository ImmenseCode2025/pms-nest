import { sumBy,groupBy } from 'lodash';

export class LodashHelper {

  static sumBy<T>(
    array: T[],
    iteratee: keyof T | ((item: T) => number),
  ): number {
    return sumBy(array, iteratee as any) || 0;
  }  
}
