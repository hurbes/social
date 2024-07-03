import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';
import {
  CreatePostRequest,
  CreateUserRequest,
  ExistingUserRequest,
  PostResponse,
  UpdatePostRequest,
  UserResponse,
} from '@app/dto';
import { User } from '@app/common';

@Injectable()
export class ApiService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('POST_SERVICE') private readonly postService: ClientProxy,
  ) {}

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

    response.cookie('Authentication', jwt, { httpOnly: true, secure: true });
    return user;
  }

  async register(body: ExistingUserRequest): Promise<UserResponse> {
    return this.authService.send({ cmd: 'register' }, { ...body }) as any;
  }
}
