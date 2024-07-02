import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Res,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiService } from './api.service';
import {
  CreateUserRequest,
  createUserSchema,
  existingUserRequest,
  ExistingUserRequest,
  ZodValidationPipe,
} from '@app/dto';
import { User } from '@app/common';

@Controller('api/v1')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  // @Get('posts')
  // getPosts() {
  //   return this.apiService.getPosts();
  // }

  // @Get('posts/:id')
  // getPostById(id: string) {
  //   return this.apiService.getPostById(id);
  // }

  // @Post('posts')
  // createPost(post: any) {
  //   return this.apiService.createPost(post);
  // }

  // @Put('posts')
  // updatePost(post: any) {
  //   return this.apiService.updatePost(post);
  // }

  @UsePipes(new ZodValidationPipe(existingUserRequest))
  @Post('auth/login')
  async login(
    @Body() body: ExistingUserRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<User> {
    return this.apiService.login(body, response);
  }

  @UsePipes(new ZodValidationPipe(createUserSchema))
  @Post('auth/register')
  async register(@Body() body: CreateUserRequest): Promise<User> {
    return this.apiService.register(body) as any;
  }

  @Get('users/:id')
  getUserById(id: string) {
    return this.apiService.getUserById(id);
  }

  @Get('users')
  getUsers() {
    return this.apiService.getUsers();
  }

  @Put('users')
  updateUser(user: any) {
    return this.apiService.updateUser(user);
  }
}
