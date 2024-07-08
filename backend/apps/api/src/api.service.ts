import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';
import {
  CommentResponse,
  CreateCommentRequest,
  CreatePostRequest,
  CreateUserRequest,
  PostResponse,
  UpdateCommentRequest,
  UpdatePostRequest,
  UserResponse,
} from '@app/dto';
import { PostComment, User, UserPost } from '@app/common';

import { faker } from '@faker-js/faker';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class ApiService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('CACHE_SERVICE') private readonly cacheService: ClientProxy,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserPost.name) private postModel: Model<UserPost>,
    @InjectModel(PostComment.name) private commentModel: Model<PostComment>,
  ) {}

  async populateDb(): Promise<void> {
    await this.userModel.deleteMany({});
    await this.postModel.deleteMany({});
    await this.commentModel.deleteMany({});

    // Create Users
    const users = [];
    for (let i = 0; i < 150; i++) {
      const user = new this.userModel({
        _id: new Types.ObjectId(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        name: faker.person.firstName() + ' ' + faker.person.lastName(),
        profile_img: faker.image.avatar(),
      });
      await user.save();
      users.push(user);
    }

    // Create Posts
    for (const user of users) {
      const numPosts = faker.datatype.number({ min: 50, max: 100 });
      for (let j = 0; j < numPosts; j++) {
        const post = new this.postModel({
          _id: new Types.ObjectId(),
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(),
          author: {
            _id: user._id,
            name: user.name,
            profile_img: user.profile_img,
          },
        });
        await post.save();

        // Create Comments
        const numComments = faker.datatype.number({ min: 200, max: 300 });
        for (let k = 0; k < numComments; k++) {
          const commentUser =
            users[faker.datatype.number({ min: 0, max: users.length - 1 })];
          const comment = new this.commentModel({
            _id: new Types.ObjectId(),
            content: faker.lorem.sentence(),
            author: {
              _id: commentUser._id,
              name: commentUser.name,
              profile_img: commentUser.profile_img,
            },
            post_id: post._id,
          });
          await comment.save();
        }
      }
    }
  }

  async getComments({
    post_id,
    startScore,
    endScore,
    pageSize,
  }: {
    post_id: string;
    startScore: number;
    endScore: number;
    pageSize: number;
  }): Promise<CommentResponse[]> {
    const $response = this.cacheService.send<CommentResponse[], any>(
      { cmd: 'comments' },
      { post_id, startScore, endScore, pageSize },
    );

    const response = await firstValueFrom($response);

    if (response.length === 0) {
      throw new NotFoundException('Comments not found.');
    }

    return response;
  }

  async createComment(comment: CreateCommentRequest): Promise<CommentResponse> {
    return this.cacheService.send<CommentResponse, any>(
      { cmd: 'add-comment' },
      { ...comment },
    ) as CommentResponse;
  }

  async updateComment(comment: UpdateCommentRequest): Promise<CommentResponse> {
    return this.cacheService.send<CommentResponse, any>(
      { cmd: 'update-comment' },
      { ...comment },
    ) as CommentResponse;
  }

  async deleteComment(id: string, author_id: string): Promise<boolean> {
    return this.cacheService.send<
      boolean,
      {
        id: string;
        author_id: string;
      }
    >(
      { cmd: 'delete-comment' },
      {
        id: id,
        author_id,
      },
    ) as any;
  }

  async getPosts(
    startScore: number,
    endScore: number,
    pageSize: number,
  ): Promise<PostResponse[]> {
    const $response = this.cacheService.send<PostResponse[], any>(
      { cmd: 'get-posts' },
      {
        startScore,
        endScore,
        pageSize,
      },
    );

    const response = await firstValueFrom($response);

    if (response.length === 0) {
      throw new NotFoundException('Posts not found.');
    }

    return response;
  }

  async getUserPosts({
    uid,
    startScore,
    endScore,
    pageSize,
  }: {
    uid: { uid: string };
    startScore: number;
    endScore: number;
    pageSize: number;
  }): Promise<PostResponse[]> {
    const $response = this.cacheService.send<PostResponse[], any>(
      { cmd: 'user-posts' },
      { uid, startScore, endScore, pageSize },
    );

    const response = await firstValueFrom($response);

    if (response.length === 0) {
      throw new NotFoundException('Posts not found.');
    }

    return response;
  }

  async getPostById(id: { post_id: string }): Promise<PostResponse> {
    console.log('post -api service', id);
    return this.cacheService.send<PostResponse>(
      { cmd: 'get-post' },
      { ...id },
    ) as PostResponse;
  }

  async createPost(post: CreatePostRequest): Promise<PostResponse> {
    return this.cacheService.send<CreatePostRequest, any>(
      { cmd: 'create-post' },
      { ...post },
    ) as PostResponse;
  }

  async updatePost(post: UpdatePostRequest): Promise<any> {
    return this.cacheService.send<PostResponse, any>(
      { cmd: 'update-post' },
      { ...post },
    );
  }

  async deletePost({
    post_id,
    author_id,
  }: {
    post_id: string;
    author_id: string;
  }): Promise<any> {
    return this.cacheService.send<any, Record<string, string>>(
      { cmd: 'delete-post' },
      { post_id, author_id },
    );
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
    const $res = this.authService.send<{
      user: UserResponse;
      jwt: string;
      refreshToken: string;
    }>({ cmd: 'login' }, { ...body });
    const { user, jwt, refreshToken } = await firstValueFrom($res);

    response.cookie('Authentication', jwt, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    return user;
  }

  async register(body: CreateUserRequest): Promise<UserResponse> {
    return this.authService.send({ cmd: 'register' }, { ...body }) as any;
  }
}
