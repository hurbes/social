import { User } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';

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

  async getUserById(id: string) {
    return this.authService.send('getUserById', id);
  }

  async getUsers() {
    return this.authService.send('getUsers', {});
  }

  async updateUser(user: any) {
    return this.authService.send('updateUser', user);
  }

  async login(body: Record<string, string>, response: Response): Promise<User> {
    const $res = this.authService.send<{ user: User; jwt: string }>(
      { cmd: 'login' },
      { ...body },
    );
    const { user, jwt } = await firstValueFrom($res);

    response.cookie('Authentication', jwt, { httpOnly: true, secure: true });
    return user;
  }

  async register(body: Record<string, string>) {
    return this.authService.send({ cmd: 'register' }, { ...body });
  }
}
