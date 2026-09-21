import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import moment from 'moment';
import { DateFilterTypeEnum } from '../helper/enum/global.enum';

@ValidatorConstraint({ async: false })
export class FilterTypeForDate implements ValidatorConstraintInterface {
  private isValidDateInput(value: unknown): boolean {
    let isValidDate = moment(value, 'YYYY-MM-DD', true).isValid();
    if (isValidDate) {
      return true;
    }

    return false;
  }
  validate(filter: any, _args: ValidationArguments): boolean {
    const { filter_type, value } = filter;
    if (!value && !filter_type) {
      return true;
    }
    if (!filter || typeof filter !== 'object') return false;

    // No filter -> valid
    if (!filter_type && (value === null || value === undefined)) return true;

    // Value present but type missing -> invalid
    if (value !== null && value !== undefined && !filter_type) return false;

    const validTypes = Object.values(DateFilterTypeEnum);
    if (!validTypes?.includes(filter_type)) return false;

    // All date filters require a valid date value
    return this.isValidDateInput(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} filter_type must be one of: ${Object.values(
      DateFilterTypeEnum,
    ).join(', ')}, and value must be a valid date ('YYYY-MM-DD').`;
  }
}
