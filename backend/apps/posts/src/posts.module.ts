import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

import {
  DatabaseModule,
  UserPost,
  UserPostSchema,
  SharedService,
  SharedModule,
} from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostRepository } from './repository/post.repository';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([
      {
        name: UserPost.name,
        schema: UserPostSchema,
      },
    ]),
    DatabaseModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostRepository,
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
  ],
})
export class PostsModule {}
