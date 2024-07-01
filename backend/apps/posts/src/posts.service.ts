import { Inject, Injectable } from '@nestjs/common';
import { PostRepository } from './repository/post.repository';
import { CreatePostDto } from './dto/create-post.request';
import { UserPost } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
// import { Post } from '@app/common';

@Injectable()
export class PostsService {
  constructor(
    private readonly postRepository: PostRepository,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  async createPost(request: CreatePostDto): Promise<UserPost> {
    return this.postRepository.create(request);
  }

  getAuth() {
    return this.authService.send({ cmd: 'auth' }, {});
  }
}
