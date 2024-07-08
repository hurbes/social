import { Controller, Inject } from '@nestjs/common';
import { PostsService } from './posts.service';
import { SharedService } from '@app/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CreatePostRequest, PostResponse, UpdatePostRequest } from '@app/dto';

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
  async getPosts(
    @Ctx() context: RmqContext,
    @Payload()
    pagination: { startScore: number; endScore: number; pageSize: number },
  ): Promise<PostResponse[]> {
    const { startScore, endScore, pageSize } = pagination;
    this.sharedService.acknowledgeMessage(context);
    return this.postsService.getPosts(startScore, endScore, pageSize);
  }

  @MessagePattern({ cmd: 'user-posts' })
  async getUserPosts(
    @Ctx() context: RmqContext,
    @Payload()
    post: {
      id: { uid: string };
      startScore: number;
      endScore: number;
      pageSize: number;
    },
  ): Promise<PostResponse[]> {
    this.sharedService.acknowledgeMessage(context);
    return this.postsService.getUserPosts(post);
  }

  @MessagePattern({ cmd: 'get-post' })
  async getPost(
    @Ctx() context: RmqContext,
    @Payload() post: string,
  ): Promise<PostResponse> {
    console.log('get-post controller', post);
    this.sharedService.acknowledgeMessage(context);
    return this.postsService.getPostById(post);
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
    @Payload() post: { post_id: string; author_id: string },
  ): Promise<boolean> {
    this.sharedService.acknowledgeMessage(context);
    return this.postsService.deletePost(post);
  }
}
