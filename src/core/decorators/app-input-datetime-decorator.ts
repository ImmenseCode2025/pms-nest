import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function AppInputDateTimeDecorator(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateTimeFormat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          // ✅ Regex: YYYY-MM-DD HH:mm, YYYY-MM-DD HH:mm:ss, or ISO formats
          return /^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}(:\d{2}(\.\d{1,3}Z?)?)?$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be in the format YYYY-MM-DD HH:mm or YYYY-MM-DD HH:mm:ss (e.g. 2025-09-20 14:30:00)`;
        },
      },
    });
  };
}
