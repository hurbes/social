import { AbstractRepository } from '@app/common';
import { User } from '../schema/user.schema';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';

@Injectable()
export class UserRespository extends AbstractRepository<User> {
  protected logger: Logger = new Logger(UserRespository.name);

  constructor(
    @InjectModel(User.name) userModel: Model<User>,
    @InjectConnection() connection: Connection,
  ) {
    super(userModel, connection);
  }
}
