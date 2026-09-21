import { Matches, ValidationOptions } from 'class-validator';

export function IsDateTimeFormat(validationOptions?: ValidationOptions) {
    return Matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, {
        message: validationOptions?.message || 'Date and time must be in YYYY-MM-DD HH:mm:ss format',
        ...validationOptions,
    });
}
