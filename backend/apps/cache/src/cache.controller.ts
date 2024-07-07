import { Controller, Inject } from '@nestjs/common';
import { CacheService } from './cache.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import {
  CreateCommentRequest,
  CreatePostRequest,
  PostResponse,
  UpdateCommentRequest,
  UpdatePostRequest,
} from '@app/dto';
import { SharedService } from '@app/common';

@Controller()
export class CacheController {
  constructor(
    private readonly cacheService: CacheService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
  ) {}

  @MessagePattern({ cmd: 'set-season' })
  async setSeason(
    @Ctx() context: RmqContext,
    @Payload()
    season: {
      userId: string;
      sessionId: string;
      refreshToken: string;
      ttl: number;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    await this.cacheService.setSession(season);
  }

  @MessagePattern({ cmd: 'get-season' })
  async getSeason(
    @Ctx() context: RmqContext,
    @Payload()
    season: { userId: string; sessionId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.cacheService.getSession(season.userId, season.sessionId);
  }

  @MessagePattern({ cmd: 'delete-season' })
  async deleteSeason(
    @Ctx() context: RmqContext,
    @Payload()
    season: { userId: string; sessionId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    await this.cacheService.deleteSession(season.userId, season.sessionId);
  }

  @MessagePattern({ cmd: 'refresh-season' })
  async refreshSeason(
    @Ctx() context: RmqContext,
    @Payload()
    season: { userId: string; sessionId: string; ttl: number },
  ) {
    this.sharedService.acknowledgeMessage(context);
    await this.cacheService.refreshSession(
      season.userId,
      season.sessionId,
      season.ttl,
    );
  }

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
    @Payload() post: string,
  ): Promise<PostResponse> {
    console.log('post -cache controller', post);
    this.sharedService.acknowledgeMessage(context);
    return this.cacheService.getPostById(post);
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

  @MessagePattern({ cmd: 'comments' })
  getComments(
    @Ctx() context: RmqContext,
    @Payload()
    post: {
      post_id: string;
      startScore: number;
      endScore: number;
      pageSize: number;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.cacheService.getCommentsByPostId(
      post.post_id,
      post.startScore,
      post.endScore,
      post.pageSize,
    );
  }

  @MessagePattern({ cmd: 'add-comment' })
  createComment(
    @Ctx() context: RmqContext,
    @Payload() comment: CreateCommentRequest,
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.cacheService.createComment(comment);
  }

  @MessagePattern({ cmd: 'update-comment' })
  updateComment(
    @Ctx() context: RmqContext,
    @Payload() comment: UpdateCommentRequest,
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.cacheService.updateComment(comment);
  }

  @MessagePattern({ cmd: 'delete-comment' })
  deleteComment(
    @Ctx() context: RmqContext,
    @Payload() comment: { id: string; author_id: string },
  ): Promise<boolean> {
    this.sharedService.acknowledgeMessage(context);
    return this.cacheService.deleteComment(comment.id, comment.author_id);
  }
}
