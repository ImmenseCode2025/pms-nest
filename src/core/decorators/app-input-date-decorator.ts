import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import moment from 'moment';

export function AppInputDateDecorator(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateFormatYYYYMMDD',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          // Must match format YYYY-MM-DD and be an actual valid calendar date
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
          return moment(value, 'YYYY-MM-DD', true).isValid();
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid calendar date in YYYY-MM-DD format (e.g. 2026-11-30)`;
        },
      },
    });
  };
}

