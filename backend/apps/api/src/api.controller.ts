import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiService } from './api.service';
import {
  CreatePostRequest,
  createPostRequestSchema,
  CreateUserRequest,
  createUserSchema,
  existingUserRequest,
  ExistingUserRequest,
  PostResponse,
  UpdatePostRequest,
  updatePostRequestSchema,
  UserResponse,
  userResponseSchema,
  ZodValidationPipe,
} from '@app/dto';
import { AuthGuard } from '@app/common';

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

  @UsePipes(new ZodValidationPipe(createPostRequestSchema))
  @UseGuards(AuthGuard)
  @Post('post')
  createPost(@Body() post: CreatePostRequest): Promise<PostResponse> {
    return this.apiService.createPost(post);
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
}
