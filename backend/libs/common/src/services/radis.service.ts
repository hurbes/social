import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

import { flattenObject, unflattenObject } from '../utils/util';
import {
  CreateUserRequest,
  PostResponse,
  UserResponse,
  userResponseSchema,
} from '@app/dto';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly client: Redis) {}

  getRedisClient() {
    return this.client;
  }

  async setSession(
    userId: string,
    sessionId: string,
    refreshToken: string,
    ttl: number,
  ): Promise<void> {
    await this.client.hmset(`session:${userId}:${sessionId}`, {
      refreshToken,
    });
    await this.client.expire(`session:${userId}:${sessionId}`, ttl);
  }

  async getSession(
    userId: string,
    sessionId: string,
  ): Promise<{ refreshToken: string }> {
    const result = await this.client.hgetall(`session:${userId}:${sessionId}`);
    if (Object.keys(result).length === 0) return null;
    return result as { refreshToken: string };
  }

  async deleteSession(userId: string, sessionId: string): Promise<void> {
    await this.client.del(`session:${userId}:${sessionId}`);
  }

  async refreshSession(
    userId: string,
    sessionId: string,
    ttl: number,
  ): Promise<void> {
    await this.client.expire(`session:${userId}:${sessionId}`, ttl);
  }
  async fetchHashes(keys: string[]): Promise<any[]> {
    if (keys.length === 0) return [];

    const pipeline = this.client.pipeline();
    keys.forEach((key) => pipeline.hgetall(key));
    const results = await pipeline.exec();

    return results.map(([err, hash]) => {
      if (err) throw err;

      return unflattenObject(hash);
    });
  }

  async addUser(userId: string, userDetails: CreateUserRequest): Promise<void> {
    const flatUser = flattenObject(userDetails);
    await this.client.hmset(`user:${userId}`, flatUser);
  }

  async getUser(userId: string): Promise<UserResponse> {
    const user = await this.client.hgetall(`user:${userId}`);
    return userResponseSchema.parse(unflattenObject(user));
  }

  async addPost(
    userId: string,
    postId: string,
    postDetails: PostResponse,
  ): Promise<void> {
    const flatPost = flattenObject(postDetails);
    await this.client.hmset(`post:${postId}`, flatPost);
    const timestamp = new Date(postDetails.createdAt).getTime();
    await this.client.zadd(`posts:byUser:${userId}`, timestamp, postId);
    await this.client.zadd('posts:global', timestamp, postId);
  }

  async getPosts(
    startScore: number,
    endScore: number,
    pageSize: number,
  ): Promise<any[]> {
    const postIds = await this.client.zrangebyscore(
      'posts:global',
      startScore,
      `(${endScore}`,
      'LIMIT',
      0,
      pageSize,
    );
    if (!postIds.length) return [];
    console.log('Fetched post IDs:', postIds);
    return this.fetchHashes(postIds.map((id) => `post:${id}`));
  }

  async getUserPosts(
    userId: string,
    startScore: number,
    endScore: number,
    pageSize: number,
  ): Promise<any[]> {
    const postIds = await this.client.zrangebyscore(
      `posts:byUser:${userId}`,
      startScore,
      endScore,
      'LIMIT',
      0,
      pageSize,
    );
    if (!postIds.length) return [];
    return this.fetchHashes(postIds.map((id) => `post:${id}`));
  }

  async updatePost(
    postId: string,
    userId: string,
    updates: any,
  ): Promise<void> {
    const flatUpdates = flattenObject(updates);
    await this.client.hmset(`post:${postId}`, flatUpdates);
    if (updates.timestamp) {
      const newTimestamp = updates.timestamp;
      await this.client.zadd('posts:global', 'XX', newTimestamp, postId);
      await this.client.zadd(
        `posts:byUser:${userId}`,
        'XX',
        newTimestamp,
        postId,
      );
    }
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    await this.client.del(`post:${postId}`);
    await this.client.zrem('posts:global', postId);
    await this.client.zrem(`posts:byUser:${userId}`, postId);
  }

  async addComment(
    postId: string,
    commentId: string,
    commentDetails: any,
  ): Promise<void> {
    const flatComment = flattenObject(commentDetails);
    await this.client.hmset(`comment:${commentId}`, flatComment);
    const timestamp = new Date().getTime();
    await this.client.zadd(`comments:byPost:${postId}`, timestamp, commentId);
  }

  async getComments(
    postId: string,
    startScore: number,
    endScore: number,
    pageSize: number,
  ): Promise<any[]> {
    const commentIds = await this.client.zrangebyscore(
      `comments:byPost:${postId}`,
      startScore,
      endScore,
      'LIMIT',
      0,
      pageSize,
    );
    if (!commentIds.length) return [];
    return this.fetchHashes(commentIds.map((id) => `comment:${id}`));
  }

  async updateComment(
    commentId: string,
    userId: string,
    updates: any,
  ): Promise<void> {
    const comment = await this.client.hgetall(`comment:${commentId}`);

    const flatUpdates = flattenObject(updates);
    await this.client.hmset(`comment:${commentId}`, flatUpdates);
    if (updates.timestamp) {
      const newTimestamp = updates.timestamp;
      await this.client.zadd(
        `comments:byPost:${comment.post_id}`,
        'XX',
        newTimestamp,
        commentId,
      );
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    const comment = await this.client.hgetall(`comment:${commentId}`);

    await this.client.del(`comment:${commentId}`);
    await this.client.zrem(`comments:byPost:${comment.post_id}`, commentId);
  }

  async setTTL(key: string, ttl: number): Promise<void> {
    await this.client.expire(key, ttl);
  }
}
