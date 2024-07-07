import { Injectable } from '@nestjs/common';

import { PostRepository } from './repository/post.repository';
import { UserPost } from '@app/common';
import {
  CreatePostRequest,
  PostResponse,
  postResponseSchema,
  UpdatePostRequest,
} from '@app/dto';

@Injectable()
export class PostsService {
  constructor(private readonly postRepository: PostRepository) {}

  async createPost(request: CreatePostRequest): Promise<PostResponse> {
    const post = await this.postRepository.create(request as UserPost);
    console.log('user-post', post);
    return postResponseSchema.parse(post);
  }

  async getPostById(post_id: string): Promise<PostResponse> {
    console.log('post -post service', post_id);
    const post = await this.postRepository.findOne({
      _id: post_id,
    });
    return postResponseSchema.parse(post);
  }

  async getPosts(
    startScore: number,
    endScore: number,
    limit: number,
  ): Promise<PostResponse[]> {
    const post = await this.postRepository.find({
      filterQuery: {
        createdAt: {
          $gte: new Date(startScore * 1000),
          $lte: new Date(endScore * 1000),
        },
      },
      sort: {
        createdAt: 1,
      },
      limit: limit,
    });

    if (!post.length) return [];
    console.log('post-data', post);
    return post.map((p) => postResponseSchema.parse(p));
  }

  async getUserPosts(postParams: {
    id: { uid: string };
    startScore: number;
    endScore: number;
    pageSize: number;
  }): Promise<PostResponse[]> {
    console.log('post-param-data', postParams);
    const post = await this.postRepository.find({
      filterQuery: {
        'author._id': postParams.id.uid,
        createdAt: {
          $gte: new Date(postParams.startScore * 1000),
          $lte: new Date(postParams.endScore * 1000),
        },
      },
      sort: {
        createdAt: 1,
      },
      limit: postParams.pageSize,
    });
    if (!post.length) return [];
    console.log('post-data-data', post);
    return post.map((p) => postResponseSchema.parse(p));
  }

  async updatePost(request: UpdatePostRequest): Promise<PostResponse> {
    const post = await this.postRepository.upsert(
      {
        _id: request._id,
        'author._id': request.author._id,
      },
      {
        title: request.title,
        content: request.content,
      },
    );
    return postResponseSchema.parse(post);
  }

  async deletePost(post: {
    post_id: string;
    author_id: string;
  }): Promise<boolean> {
    return await this.postRepository.delete({
      _id: post.post_id,
      'author._id': post.author_id,
    });
  }
}
