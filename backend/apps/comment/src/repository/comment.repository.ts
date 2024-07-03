import { AbstractRepository, PostComment } from '@app/common';

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';

@Injectable()
export class CommentRepository extends AbstractRepository<PostComment> {
  protected logger: Logger = new Logger(CommentRepository.name);

  constructor(
    @InjectModel(PostComment.name) commentModel: Model<PostComment>,
    @InjectConnection() connection: Connection,
  ) {
    super(commentModel, connection);
  }
}
