import { Controller, Inject } from '@nestjs/common';
import { PostsService } from './posts.service';
import { SharedService } from '@app/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import {
  CreatePostRequest,
  PostResponse,
  UpdatePostRequest,
} from 'shared-schema';

@Controller()
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
  ) {}

  @MessagePattern({ cmd: 'create-post' })
  async createPost(
    @Ctx() context: RmqContext,
    @Payload() post: CreatePostRequest,
  ): Promise<PostResponse> {
    this.sharedService.acknowledgeMessage(context);

    return this.postsService.createPost(post);
  }

  @MessagePattern({ cmd: 'get-posts' })
  async getPosts(@Ctx() context: RmqContext): Promise<PostResponse[]> {
    this.sharedService.acknowledgeMessage(context);
    return this.postsService.getPosts();
  }

  @MessagePattern({ cmd: 'user-posts' })
  async getUserPosts(
    @Ctx() context: RmqContext,
    @Payload() user: { id: string },
  ): Promise<PostResponse[]> {
    this.sharedService.acknowledgeMessage(context);
    return this.postsService.getUserPosts(user.id);
  }

  @MessagePattern({ cmd: 'get-post' })
  async getPost(
    @Ctx() context: RmqContext,
    @Payload() post: { id: string },
  ): Promise<PostResponse> {
    this.sharedService.acknowledgeMessage(context);
    return this.postsService.getPostById(post.id);
  }

  @MessagePattern({ cmd: 'update-post' })
  async updatePost(
    @Ctx() context: RmqContext,
    @Payload() post: UpdatePostRequest,
  ): Promise<PostResponse> {
    this.sharedService.acknowledgeMessage(context);
    return this.postsService.updatePost(post);
  }

  @MessagePattern({ cmd: 'delete-post' })
  async deletePost(
    @Ctx() context: RmqContext,
    @Payload() post: { id: string },
  ): Promise<void> {
    this.sharedService.acknowledgeMessage(context);
    return this.postsService.deletePost(post.id);
  }
}
