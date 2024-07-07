import { RedisService } from '@app/common';
import {
  CreatePostRequest,
  PostResponse,
  postResponseSchema,
  UpdatePostRequest,
} from '@app/dto';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class CacheService {
  constructor(
    private readonly redisService: RedisService,
    @Inject('POST_SERVICE') private readonly postService: ClientProxy,
  ) {}

  /**
   * Create a post with caching logic.
   * Implements write-through caching to ensure cache consistency.
   * @param postDetails Details of the post to create.
   * @returns Created post details.
   */
  async createPost(postDetails: CreatePostRequest): Promise<PostResponse> {
    const $post = this.postService.send({ cmd: 'create-post' }, postDetails);
    const post: PostResponse = await firstValueFrom($post);
    await this.redisService.addPost(
      postDetails.author._id.toString(),
      post._id.toString(),
      post,
    );

    return post;
  }

  /**
   * Get a single post by ID with caching.
   * Implements read-through caching for efficient data retrieval.
   * @param postId The unique identifier for the post.
   * @returns The requested post details.
   */
  async getPostById(postId: string): Promise<PostResponse> {
    let post: PostResponse = await this.redisService
      .getRedisClient()
      .hgetall(`post:${postId}`);
    if (!post || Object.keys(post).length === 0) {
      post = await firstValueFrom(
        this.postService.send({ cmd: 'get-post' }, { post_id: postId }),
      );
      if (post) {
        await this.redisService.addPost(
          post.author._id.toString(),
          postId,
          post,
        );
      }
    }
    return postResponseSchema.parse(post);
  }

  /**
   * Get all posts with pagination and caching.
   * Implements read-through caching with pagination support.
   * @param startScore The starting score for pagination.
   * @param endScore The ending score for pagination.
   * @param pageSize The number of items to retrieve.
   * @returns A list of posts for the requested page.
   */
  async getPosts(
    startScore: number,
    endScore: number,
    pageSize: number,
  ): Promise<PostResponse[]> {
    // Try to fetch posts from Redis cache
    const postIds = await this.redisService.getPosts(
      startScore,
      endScore,
      pageSize,
    );

    if (postIds.length === 0) {
      // Cache miss: fetch posts from the database
      const posts: PostResponse[] = await firstValueFrom(
        this.postService.send(
          { cmd: 'get-posts' },
          { startScore, endScore, pageSize },
        ),
      );

      for (const post of posts) {
        await this.redisService.addPost(
          post.author._id.toString(),
          post._id.toString(),
          post,
        );
      }
      return posts.map((post: any) => postResponseSchema.parse(post));
    } else {
      // Cache hit: return posts from Redis
      const posts = await this.redisService.fetchHashes(
        postIds.map((id) => `post:${id}`),
      );
      return posts;
    }
  }
  /**
   * Get posts by a specific user with pagination and caching.
   * Implements read-through caching with pagination support.
   * @param userId The unique identifier for the user.
   * @param startScore The starting score for pagination.
   * @param endScore The ending score for pagination.
   * @param pageSize The number of items to retrieve.
   * @returns A list of posts by the specified user.
   */
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
    const postIds = await this.redisService
      .getRedisClient()
      .zrangebyscore(
        `posts:byUser:${uid.uid}`,
        startScore,
        endScore,
        'LIMIT',
        0,
        pageSize,
      );
    if (postIds.length === 0) {
      const posts = await firstValueFrom(
        this.postService.send(
          { cmd: 'user-posts' },
          { id: uid, startScore, endScore, pageSize },
        ),
      );
      for (const post of posts) {
        await this.redisService.addPost(uid.uid, post._id.toString(), post);
      }
      return posts.map((post: any) => postResponseSchema.parse(post));
    } else {
      const posts = await this.redisService.fetchHashes(
        postIds.map((id) => `post:${id}`),
      );
      return posts.map((post: any) => postResponseSchema.parse(post));
    }
  }

  /**
   * Update a post with caching logic.
   * Implements write-through caching for data consistency.
   * Verifies ownership by checking both post ID and author ID.
   * @param postDetails Details of the post to update.
   * @returns The updated post details.
   */
  async updatePost(postDetails: UpdatePostRequest): Promise<any> {
    console.log('Updating post in cache', postDetails);
    const { _id, author } = postDetails;
    await this.redisService.updatePost(
      _id.toString(),
      author._id.toString(),
      postDetails,
    );

    return this.postService.send({ cmd: 'update-post' }, postDetails);
  }

  /**
   * Delete a post with caching logic.
   * Implements write-through caching for data consistency.
   * Verifies ownership by checking both post ID and author ID.
   * @param postId The unique identifier for the post.
   * @param userId The unique identifier for the user who authored the post.
   */
  async deletePost({
    post_id,
    author_id,
  }: {
    post_id: string;
    author_id: string;
  }): Promise<any> {
    await this.redisService.deletePost(post_id, author_id);
    return this.postService.send<boolean>(
      { cmd: 'delete-post' },
      {
        post_id: post_id,
        author_id: author_id,
      },
    );
  }
}
