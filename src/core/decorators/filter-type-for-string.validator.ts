import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isArray } from 'lodash';

@ValidatorConstraint({ async: false })
export class FilterTypeForString implements ValidatorConstraintInterface {
  validate(filter: any, args: ValidationArguments): boolean {
    let { filter_type, value } = filter;

    if (!filter_type && !value) {
      return true;
    }
    if (value && !filter_type) {
      return false;
    }
    if (!filter_type) {
      return false;
    }
    const validFilterTypes = ['equals', 'contains', 'one_of'];
    if (!validFilterTypes?.includes(filter_type)) {
      return false;
    }
    if (filter_type === 'one_of' && !isArray(value)) {
      return false;
    }

    return true;
  }

  defaultMessage(args: any): string {
    return `${args.property} filter_type must contain one of the following values: 'equals', 'contains', 'one_of'. If 'one_of' is used, the value must be an array.`;
  }
}
