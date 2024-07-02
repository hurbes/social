/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}
  transform(value: any, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (result.success) {
      return result.data;
    }

    throw new BadRequestException(result.error.format());
  }
}
