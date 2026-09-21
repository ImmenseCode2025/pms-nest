import { NestMiddleware } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { NextFunction, Request, Response } from 'express';

@ValidatorConstraint({ async: true })
export class UniqueOnDatabaseExistConstraint
  implements ValidatorConstraintInterface, NestMiddleware
{
  use(req: Request, res: Response, next: NextFunction) {
    next();
  }
  async validate(value: any, args: ValidationArguments) {
    const entity = args.object[`class_entity_${args.property}`];
    if (!value) {
      return false;
    }
    const recordCount = await entity
      .query()
      .where(args.property, value)
      .count('* as count')
      .first()
      .then((data) => data.count < 1);
    return recordCount;
  }
}

export function UniqueOnDatabase(
  entity: Function,
  validationOptions?: ValidationOptions,
) {
  validationOptions = {
    ...{ message: `$value already exists. Choose another.` },
    ...validationOptions,
  };
  return function (object: Object, propertyName: string) {
    object[`class_entity_${propertyName}`] = entity;
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: UniqueOnDatabaseExistConstraint,
    });
  };
}
