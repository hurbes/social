import { Injectable } from '@nestjs/common';

import { PostRepository } from './repository/post.repository';
import { UserPost, RedisCacheService } from '@app/common';
import {
  CreatePostRequest,
  PostResponse,
  postResponseSchema,
  UpdatePostRequest,
} from 'shared-schema';

@Injectable()
export class PostsService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly cache: RedisCacheService,
  ) {}

  async createPost(request: CreatePostRequest): Promise<PostResponse> {
    const post = await this.postRepository.create(request as UserPost);
    return postResponseSchema.parse(post);
  }

  async getPostById(id: string): Promise<PostResponse> {
    const post = await this.postRepository.findOne({ _id: id });
    return postResponseSchema.parse(post);
  }

  async getPosts(): Promise<PostResponse[]> {
    const post = await this.postRepository.find();

    return post.map((p) => postResponseSchema.parse(p));
  }

  async getUserPosts(uid: string): Promise<PostResponse[]> {
    const post = await this.postRepository.find({
      'author._id': uid,
    });

    return post.map((p) => postResponseSchema.parse(p));
  }

  async updatePost(request: UpdatePostRequest): Promise<PostResponse> {
    const post = await this.postRepository.upsert(
      request as UserPost,
      request._id,
    );
    return postResponseSchema.parse(post);
  }

  async deletePost(id: string): Promise<void> {
    await this.postRepository.delete({ _id: id });
  }
}
