import { Injectable } from '@nestjs/common';
import { PostRepository } from './repository/post.repository';
import { CreatePostDto } from './dto/create-post.request';
import { UserPost } from '@app/common';
// import { Post } from '@app/common';

@Injectable()
export class PostsService {
  constructor(private readonly postRepository: PostRepository) {}

  async createPost(request: CreatePostDto): Promise<UserPost> {
    return this.postRepository.create(request);
  }
}
