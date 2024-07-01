import { AbstractRepository, UserPost } from '@app/common';

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';

@Injectable()
export class PostRepository extends AbstractRepository<UserPost> {
  protected logger: Logger = new Logger(PostRepository.name);

  constructor(
    @InjectModel(UserPost.name) postModel: Model<UserPost>,
    @InjectConnection() connection: Connection,
  ) {
    super(postModel, connection);
  }
}
