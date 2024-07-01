import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

import { DatabaseModule, UserPost, UserPostSchema } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostRepository } from './repository/post.repository';
import { SharedModule } from '@app/common/modules/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserPost.name,
        schema: UserPostSchema,
      },
    ]),
    DatabaseModule,
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
  ],
  controllers: [PostsController],
  providers: [PostsService, PostRepository],
})
export class PostsModule {}
