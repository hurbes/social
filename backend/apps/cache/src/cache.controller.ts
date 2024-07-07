import { Controller, Inject } from '@nestjs/common';
import { CacheService } from './cache.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CreatePostRequest, PostResponse, UpdatePostRequest } from '@app/dto';
import { SharedService } from '@app/common';

@Controller()
export class CacheController {
  constructor(
    private readonly cacheService: CacheService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
  ) {}

  @MessagePattern({ cmd: 'get-posts' })
  async getPosts(
    @Ctx() context: RmqContext,
    @Payload()
    pagination: { startScore: number; endScore: number; pageSize: number },
  ): Promise<PostResponse[]> {
    this.sharedService.acknowledgeMessage(context);
    const { startScore, endScore, pageSize } = pagination;
    return this.cacheService.getPosts(startScore, endScore, pageSize);
  }

  @MessagePattern({ cmd: 'user-posts' })
  async getUserPosts(
    @Ctx() context: RmqContext,
    @Payload()
    post: {
      uid: { uid: string };
      startScore: number;
      endScore: number;
      pageSize: number;
    },
  ): Promise<PostResponse[]> {
    this.sharedService.acknowledgeMessage(context);
    return this.cacheService.getUserPosts(post);
  }

  @MessagePattern({ cmd: 'get-post' })
  async getPost(
    @Ctx() context: RmqContext,
    @Payload() post: { post_id: string },
  ): Promise<PostResponse> {
    this.sharedService.acknowledgeMessage(context);
    return this.cacheService.getPostById(post.post_id);
  }

  @MessagePattern({ cmd: 'create-post' })
  async createPost(
    @Ctx() context: RmqContext,
    @Payload() post: CreatePostRequest,
  ): Promise<PostResponse> {
    this.sharedService.acknowledgeMessage(context);
    return this.cacheService.createPost(post);
  }

  @MessagePattern({ cmd: 'update-post' })
  async updatePost(
    @Ctx() context: RmqContext,
    @Payload() post: UpdatePostRequest,
  ): Promise<PostResponse> {
    this.sharedService.acknowledgeMessage(context);
    return this.cacheService.updatePost(post);
  }

  @MessagePattern({ cmd: 'delete-post' })
  async deletePost(
    @Ctx() context: RmqContext,
    @Payload() post: { post_id: string; author_id: string },
  ): Promise<void> {
    this.sharedService.acknowledgeMessage(context);
    return this.cacheService.deletePost(post);
  }
}
