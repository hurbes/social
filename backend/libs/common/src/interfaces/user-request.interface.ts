import { Request } from 'express';
import { Author } from '@app/dto';

export interface UserRequest extends Request {
  user?: Author;
}
