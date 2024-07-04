import { Author } from '@app/dto/schema/auther/auth.schema';
import { Request } from 'express';

export interface UserRequest extends Request {
  user?: Author;
}
