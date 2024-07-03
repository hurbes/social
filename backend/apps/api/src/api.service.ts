import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';
import { CreateUserRequest, ExistingUserRequest, UserResponse } from '@app/dto';
import { User } from '@app/common';

@Injectable()
export class ApiService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    //  @Inject('POST_SERVICE') private readonly postService: ClientProxy,
  ) {}

  // async getPosts() {
  //   return this.postService.send('getPosts', {});
  // }

  // async getPostById(id: string) {
  //   return this.postService.send('getPostById', id);
  // }

  // async createPost(post: any) {
  //   return this.postService.send('createPost', post);
  // }

  // async updatePost(post: any) {
  //   return this.postService.send('updatePost', post);
  // }

  // async deletePost(id: string) {
  //   return this.postService.send('deletePost', id);
  // }

  async getUserById(id: string): Promise<UserResponse> {
    return this.authService.send<User>({ cmd: 'get-user' }, id) as any;
  }

  async getUsers(): Promise<UserResponse[]> {
    return this.authService.send({ cmd: 'get-users' }, {}) as any;
  }

  async updateUser(user: UserResponse): Promise<UserResponse> {
    return this.authService.send({ cmd: 'update-User' }, { ...user }) as any;
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
