import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';
import {
  CommentResponse,
  CreateCommentRequest,
  CreatePostRequest,
  CreateUserRequest,
  ExistingUserRequest,
  PostResponse,
  UpdateCommentRequest,
  UpdatePostRequest,
  UserResponse,
} from 'shared-schema';
import { User } from '@app/common';

@Injectable()
export class ApiService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('POST_SERVICE') private readonly postService: ClientProxy,
    @Inject('COMMENT_SERVICE') private readonly commentService: ClientProxy,
  ) {}

  async getComments(post_id: string): Promise<CommentResponse[]> {
    const $response = this.commentService.send<CommentResponse[], any>(
      { cmd: 'comments' },
      post_id,
    );

    const response = await firstValueFrom($response);

    if (response.length === 0) {
      throw new NotFoundException('Comments not found.');
    }

    return response;
  }

  async createComment(comment: CreateCommentRequest): Promise<CommentResponse> {
    console.log('comment', comment);
    return this.commentService.send<CommentResponse, any>(
      { cmd: 'add-comment' },
      { ...comment },
    ) as CommentResponse;
  }

  async updateComment(comment: UpdateCommentRequest): Promise<CommentResponse> {
    return this.commentService.send<CommentResponse, any>(
      { cmd: 'update-comment' },
      { ...comment },
    ) as CommentResponse;
  }

  async deleteComment(id: string): Promise<void> {
    this.commentService.send<void, string>({ cmd: 'delete-comment' }, id);
  }

  async getPosts(): Promise<PostResponse[]> {
    const $response = this.postService.send<PostResponse[], any>(
      { cmd: 'get-posts' },
      {},
    );

    const response = await firstValueFrom($response);

    if (response.length === 0) {
      throw new NotFoundException('Posts not found.');
    }

    return response;
  }

  async getUserPosts(uid: string): Promise<PostResponse[]> {
    const $response = this.postService.send<PostResponse[], any>(
      { cmd: 'user-posts' },
      uid,
    );

    const response = await firstValueFrom($response);

    if (response.length === 0) {
      throw new NotFoundException('Posts not found.');
    }

    return response;
  }

  async getPostById(id: string): Promise<PostResponse> {
    return this.postService.send<PostResponse, string>(
      { cmd: 'get-post' },
      id,
    ) as PostResponse;
  }

  async createPost(post: CreatePostRequest): Promise<PostResponse> {
    return this.postService.send<CreatePostRequest, any>(
      { cmd: 'create-post' },
      { ...post },
    ) as PostResponse;
  }

  async updatePost(post: UpdatePostRequest): Promise<PostResponse> {
    return this.postService.send<PostResponse, any>(
      { cmd: 'update-post' },
      { ...post },
    ) as UserResponse;
  }

  async deletePost(id: string): Promise<void> {
    this.postService.send<void, string>({ cmd: 'delete-post' }, id);
  }

  async getUserById(id: string): Promise<UserResponse> {
    return this.authService.send<User>({ cmd: 'get-user' }, id) as any;
  }

  async getUsers(): Promise<UserResponse[]> {
    return this.authService.send({ cmd: 'get-users' }, {}) as any;
  }

  async updateUser(user: UserResponse): Promise<UserResponse> {
    return this.authService.send({ cmd: 'update-user' }, { ...user }) as any;
  }

  async login(
    body: CreateUserRequest,
    response: Response,
  ): Promise<UserResponse> {
    const $res = this.authService.send<{ user: UserResponse; jwt: string }>(
      { cmd: 'login' },
      { ...body },
    );
    const { user, jwt } = await firstValueFrom($res);

    response.cookie('Authentication', jwt, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 24 * 7,
    });
    return user;
  }

  async register(body: ExistingUserRequest): Promise<UserResponse> {
    return this.authService.send({ cmd: 'register' }, { ...body }) as any;
  }
}
