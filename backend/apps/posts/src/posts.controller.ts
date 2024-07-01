import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

  @Get('get')
  async getPosts(): Promise<UserPost[]> {
    return this.postsService.getPosts();
  }

  @Get('get/:id')
  async getPost(@Param('id') id: string): Promise<UserPost> {
    return this.postsService.getPost(id);
  }

  @Get('auth')
  async getAuth(): Promise<string> {
    return this.postsService.getAuth() as any;
  }
}
