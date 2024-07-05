import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiService } from './api.service';

import { Types } from 'mongoose';
import { AuthGuard, UserRequest } from '@app/common';
import { UserInterceptor } from '@app/common/interceptors/user.interceptor';
import { ZodValidationPipe } from '@app/dto';
import {
  CommentResponse,
  CreateCommentRequest,
  createCommentRequestSchema,
  PostResponse,
  CreatePostRequest,
  createPostRequestSchema,
  UpdatePostRequest,
  updatePostRequestSchema,
  ExistingUserRequest,
  existingUserRequest,
  CreateUserRequest,
  createUserSchema,
  UserResponse,
  userResponseSchema,
  UpdateCommentRequest,
} from '@app/dto';

@Controller('api/v1')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @UsePipes(new ZodValidationPipe(existingUserRequest))
  @Post('auth/login')
  async login(
    @Body() body: ExistingUserRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserResponse> {
    return this.apiService.login(body, response);
  }

  @UsePipes(new ZodValidationPipe(createUserSchema))
  @Post('auth/register')
  async register(@Body() body: CreateUserRequest): Promise<UserResponse> {
    return this.apiService.register(body) as any;
  }

  @UseGuards(AuthGuard)
  @Get('user/:id')
  getUserById(@Param() id: string): Promise<UserResponse> {
    return this.apiService.getUserById(id);
  }

  @UseGuards(AuthGuard)
  @Get('users')
  getUsers(): Promise<UserResponse[]> {
    return this.apiService.getUsers();
  }

  @UsePipes(new ZodValidationPipe(userResponseSchema))
  @UseGuards(AuthGuard)
  @Put('users')
  updateUser(user: UserResponse): Promise<UserResponse> {
    return this.apiService.updateUser(user);
  }

  @UseGuards(AuthGuard)
  @Get('posts')
  getPosts(): Promise<PostResponse[]> {
    return this.apiService.getPosts();
  }

  @UseGuards(AuthGuard)
  @Get('posts/user/:id')
  getUserPosts(@Param() uid: string): Promise<PostResponse[]> {
    return this.apiService.getUserPosts(uid);
  }

  @UseGuards(AuthGuard)
  @Get('post/:id')
  getPostById(@Param() id: string): Promise<PostResponse> {
    return this.apiService.getPostById(id);
  }

  @UseInterceptors(UserInterceptor)
  @UsePipes(new ZodValidationPipe(createPostRequestSchema))
  @UseGuards(AuthGuard)
  @Post('post')
  createPost(
    @Body() post: CreatePostRequest,
    @Req() request: UserRequest,
  ): Promise<PostResponse> {
    const postWithUser = { ...post, author: request.user };
    return this.apiService.createPost(postWithUser);
  }

  @UsePipes(new ZodValidationPipe(updatePostRequestSchema))
  @UseGuards(AuthGuard)
  @Put('post')
  updatePost(@Body() post: UpdatePostRequest): Promise<PostResponse> {
    return this.apiService.updatePost(post);
  }

  @UseGuards(AuthGuard)
  @Delete('post/:id')
  deletePost(@Param() id: string): Promise<void> {
    return this.apiService.deletePost(id);
  }

  @UseGuards(AuthGuard)
  @Get('post/:id/comments')
  getComments(@Param() id: { id: string }): Promise<CommentResponse[]> {
    console.log('id', id.id);
    return this.apiService.getComments(id.id);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @UsePipes(new ZodValidationPipe(createCommentRequestSchema))
  @Post('post/:id/comment')
  createComment(
    @Body() comment: CreateCommentRequest,
    @Req() request: UserRequest,
    @Param() id: { id: string },
  ): Promise<CommentResponse> {
    const commentWithUser = {
      ...comment,
      author: request.user,
      post_id: new Types.ObjectId(id.id),
    };
    console.log('commentWithUser', commentWithUser, comment, request.user);

    return this.apiService.createComment(commentWithUser);
  }

  @UseGuards(AuthGuard)
  @Put('comment')
  updateComment(
    @Body() comment: UpdateCommentRequest,
  ): Promise<CommentResponse> {
    return this.apiService.updateComment(comment);
  }

  @UseGuards(AuthGuard)
  @Delete('comment/:id')
  deleteComment(@Param() id: string): Promise<void> {
    return this.apiService.deleteComment(id);
  }
}
