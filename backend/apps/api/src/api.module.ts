import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import {
  AuthModule,
  DatabaseModule,
  PostComment,
  PostCommentSchema,
  SharedModule,
  User,
  UserPost,
  UserPostSchema,
  UserSchema,
} from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    AuthModule,
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    SharedModule.registerRmq('POST_SERVICE', process.env.RABBITMQ_POST_QUEUE),
    SharedModule.registerRmq('CACHE_SERVICE', process.env.RABBITMQ_CACHE_QUEUE),
    MongooseModule.forFeature([
      {
        name: PostComment.name,
        schema: PostCommentSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: UserPost.name,
        schema: UserPostSchema,
      },
    ]),
    DatabaseModule,
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
