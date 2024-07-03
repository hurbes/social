import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

import {
  DatabaseModule,
  RedisModule,
  RedisCacheService,
  UserPost,
  UserPostSchema,
  SharedService,
  SharedModule,
} from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostRepository } from './repository/post.repository';
import { AuthModule } from '@app/common/modules/auth.module';

@Module({
  imports: [
    AuthModule,
    SharedModule,
    MongooseModule.forFeature([
      {
        name: UserPost.name,
        schema: UserPostSchema,
      },
    ]),
    DatabaseModule,
    RedisModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostRepository,
    RedisCacheService,
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
  ],
})
export class PostsModule {}
