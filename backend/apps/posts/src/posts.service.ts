import { Inject, Injectable } from '@nestjs/common';
import { PostRepository } from './repository/post.repository';
import { CreatePostDto } from './dto/create-post.request';
import { UserPost, RedisCacheService } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
// import { Post } from '@app/common';

@Injectable()
export class PostsService {
  constructor(
    private readonly postRepository: PostRepository,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    private readonly cache: RedisCacheService,
  ) {}

  async createPost(request: CreatePostDto): Promise<UserPost> {
    const newPost = await this.postRepository.create(request);
    console.log('New post created:', newPost);
    this.cache.set(newPost._id.toString(), newPost);
    return newPost;
  }

  async getPost(id: string): Promise<UserPost> {
    const cachedPost = await this.cache.get(id);
    if (cachedPost) {
      console.log('Cache hit');
      return cachedPost as UserPost;
    }

    return this.postRepository.findOne({ _id: id });
  }

  async getPosts(): Promise<UserPost[]> {
    return this.postRepository.find();
  }

  getAuth() {
    return this.authService.send({ cmd: 'auth' }, {});
  }
}
