import { Body, Controller, Post } from '@nestjs/common';
import { PostsService } from './posts.service';
// import { Post } from '@app/common';
import { CreatePostDto } from './dto/create-post.request';
import { UserPost } from '@app/common';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('create')
  async createPost(@Body() createPostDto: CreatePostDto): Promise<UserPost> {
    return await this.postsService.createPost(createPostDto);
  }
}
