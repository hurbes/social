import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DatabaseModule,
  PostComment,
  PostCommentSchema,
  SharedModule,
  SharedService,
} from '@app/common';
import { CommentRepository } from './repository/comment.repository';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([
      {
        name: PostComment.name,
        schema: PostCommentSchema,
      },
    ]),
    DatabaseModule,
  ],
  controllers: [CommentController],
  providers: [
    CommentService,
    CommentRepository,
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
  ],
})
export class CommentModule {}
