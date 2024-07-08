import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
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
  PostResponse,
  CreatePostRequest,
  createPostRequestSchema,
  UpdatePostRequest,
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
  getPosts(
    @Query('start') startScore: number,
    @Query('end') endScore: number,
    @Query('limit') limit: number,
  ): Promise<PostResponse[]> {
    return this.apiService.getPosts(startScore, endScore, limit);
  }

  @UseGuards(AuthGuard)
  @Get('posts/user/:uid')
  getUserPosts(
    @Param() uid: { uid: string },
    @Query('start') startScore: number,
    @Query('end') endScore: number,
    @Query('limit') limit: number,
  ): Promise<PostResponse[]> {
    console.log('uid', uid);
    return this.apiService.getUserPosts({
      uid,
      startScore,
      endScore,
      pageSize: limit,
    });
  }

  @UseGuards(AuthGuard)
  @Get('post/:id')
  getPostById(@Param() id: string): Promise<PostResponse> {
    console.log('post -api controller', id);
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
    console.log('postWithUser', request.user);
    return this.apiService.createPost(postWithUser);
  }

  @UseInterceptors(UserInterceptor)
  @UseGuards(AuthGuard)
  @Patch('post/:id')
  updatePost(
    @Body() post: UpdatePostRequest,
    @Req() request: UserRequest,
    @Param() id: { id: string },
  ): Promise<any> {
    const postWithUser = {
      ...post,
      author: request.user,
      _id: new Types.ObjectId(id.id),
    };

    return this.apiService.updatePost(postWithUser);
  }

  @UseInterceptors(UserInterceptor)
  @UseGuards(AuthGuard)
  @Delete('post/:id')
  deletePost(
    @Req() request: UserRequest,
    @Param() id: { id: string },
  ): Promise<void> {
    const author_id = request.user._id;
    return this.apiService.deletePost({
      post_id: id.id,
      author_id: author_id.toString(),
    });
  }

  @UseGuards(AuthGuard)
  @Get('post/:id/comments')
  getComments(
    @Param() id: { id: string },
    @Query('start') startScore: number,
    @Query('end') endScore: number,
    @Query('limit') limit: number,
  ): Promise<CommentResponse[]> {
    return this.apiService.getComments({
      post_id: id.id,
      startScore,
      endScore,
      pageSize: limit,
    });
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
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

    return this.apiService.createComment(commentWithUser);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Patch('post/comment/:id')
  updateComment(
    @Body() comment: UpdateCommentRequest,
    @Req() request: UserRequest,
    @Param() id: { id: string },
  ): Promise<CommentResponse> {
    const updatedComment = {
      content: comment.content,
      _id: new Types.ObjectId(id.id),
      author_id: request.user._id,
    };
    return this.apiService.updateComment(updatedComment);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Delete('post/comment/:id')
  deleteComment(
    @Param() id: { id: string },
    @Req() request: UserRequest,
  ): Promise<void> {
    const author_id = request.user._id;
    return this.apiService.deleteComment(id.id, author_id.toString()) as any;
  }

  @Get('populate-db')
  populateDb(): Promise<void> {
    return this.apiService.populateDb();
  }
}
