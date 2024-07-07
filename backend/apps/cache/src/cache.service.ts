import { RedisService } from '@app/common';
import {
  CommentResponse,
  commentResponseSchema,
  CreateCommentRequest,
  CreatePostRequest,
  PostResponse,
  postResponseSchema,
  UpdateCommentRequest,
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
    @Inject('COMMENT_SERVICE') private readonly commentService: ClientProxy,
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
    console.log('post -cache service', postId);
    let post: PostResponse = await this.redisService
      .getRedisClient()
      .hgetall(`post:${postId}`);
    if (!post || Object.keys(post).length === 0) {
      post = await firstValueFrom(
        this.postService.send({ cmd: 'get-post' }, postId),
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
        if (postResponseSchema.safeParse(post).success)
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
      return posts.map((post: any) => postResponseSchema.parse(post));
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

  // Post methods (already implemented) ...

  /**
   * Create a comment with caching logic.
   * Implements write-through caching to ensure cache consistency.
   * @param commentDetails Details of the comment to create.
   * @returns Created comment details.
   */
  async createComment(
    commentDetails: CreateCommentRequest,
  ): Promise<CommentResponse> {
    const $comment = this.commentService.send(
      { cmd: 'add-comment' },
      commentDetails,
    );
    const comment: CommentResponse = await firstValueFrom($comment);
    await this.redisService.addComment(
      comment.post_id.toString(),
      comment._id.toString(),
      comment,
    );

    return commentResponseSchema.parse(comment);
  }

  /**
   * Get comments by post ID with pagination and caching.
   * Implements read-through caching with pagination support.
   * @param postId The unique identifier for the post.
   * @param startScore The starting score for pagination.
   * @param endScore The ending score for pagination.
   * @param pageSize The number of items to retrieve.
   * @returns A list of comments for the requested page.
   */
  async getCommentsByPostId(
    postId: string,
    startScore: number,
    endScore: number,
    pageSize: number,
  ): Promise<CommentResponse[]> {
    // Try to fetch comments from Redis cache
    const commentIds = await this.redisService.getComments(
      postId,
      startScore,
      endScore,
      pageSize,
    );

    if (commentIds.length === 0) {
      // Cache miss: fetch comments from the database
      const comments: CommentResponse[] = await firstValueFrom(
        this.commentService.send(
          { cmd: 'comments' },
          { post_id: postId, startScore, endScore, pageSize },
        ),
      );

      for (const comment of comments) {
        await this.redisService.addComment(
          comment.post_id.toString(),
          comment._id.toString(),
          comment,
        );
      }
      return comments.map((comment: any) =>
        commentResponseSchema.parse(comment),
      );
    } else {
      // Cache hit: return comments from Redis
      const comments = await this.redisService.fetchHashes(
        commentIds.map((id) => `comment:${id}`),
      );
      return comments;
    }
  }

  /**
   * Update a comment with caching logic.
   * Implements write-through caching for data consistency.
   * Verifies ownership by checking both comment ID and author ID.
   * @param commentDetails Details of the comment to update.
   * @returns The updated comment details.
   */
  async updateComment(
    commentDetails: UpdateCommentRequest,
  ): Promise<CommentResponse> {
    console.log('Updating comment in cache', commentDetails);
    const { _id, author_id } = commentDetails;
    await this.redisService.updateComment(
      _id.toString(),
      author_id.toString(),
      commentDetails,
    );

    const updatedComment = await firstValueFrom(
      this.commentService.send({ cmd: 'update-comment' }, commentDetails),
    );
    return commentResponseSchema.parse(updatedComment);
  }

  /**
   * Delete a comment with caching logic.
   * Implements write-through caching for data consistency.
   * Verifies ownership by checking both comment ID and author ID.
   * @param commentId The unique identifier for the comment.
   * @param authorId The unique identifier for the user who authored the comment.
   */
  async deleteComment(commentId: string, authorId: string): Promise<boolean> {
    await this.redisService.deleteComment(commentId);
    return firstValueFrom(
      this.commentService.send<boolean>(
        { cmd: 'delete-comment' },
        { comment_id: commentId, author_id: authorId },
      ),
    );
  }
}
