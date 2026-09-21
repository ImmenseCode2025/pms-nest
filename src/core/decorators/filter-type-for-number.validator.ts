import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { NumberFilterTypeEnum } from '../helper/enum/global.enum';

@ValidatorConstraint({ async: false })
export class FilterTypeForNumber implements ValidatorConstraintInterface {
  validate(filter: any, _args: ValidationArguments): boolean {
    const { filter_type, value } = filter;
    if (!value && !filter_type) {
      return true;
    }
    if (!filter || typeof filter !== 'object') return false;

    if (!filter_type && value == null) return true; // no filter
    if (value != null && !filter_type) return false;

    const validTypes = Object.values(NumberFilterTypeEnum);
    if (!validTypes?.includes(filter_type)) return false;

    return typeof value === 'number' && !Number.isNaN(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} filter_type must be one of: ${Object.values(
      NumberFilterTypeEnum,
    ).join(', ')} and value must be a number.`;
  }
}
