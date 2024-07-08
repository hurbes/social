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
  UserResponse,
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

  async addUser(user: UserResponse): Promise<void> {
    await this.redisService.addUser(user._id.toString(), user);
  }

  async getUserById(id: string): Promise<UserResponse | undefined> {
    return this.redisService.getUser(id);
  }

  async setSession(season: {
    userId: string;
    sessionId: string;
    refreshToken: string;
    ttl: number;
  }): Promise<void> {
    await this.redisService.setSession(
      season.userId,
      season.sessionId,
      season.refreshToken,
      season.ttl,
    );
  }

  async getSession(
    userId: string,
    sessionId: string,
  ): Promise<{ refreshToken: string }> {
    return this.redisService.getSession(userId, sessionId);
  }

  async deleteSession(userId: string, sessionId: string): Promise<void> {
    await this.redisService.deleteSession(userId, sessionId);
  }

  async refreshSession(
    userId: string,
    sessionId: string,
    ttl: number,
  ): Promise<void> {
    await this.redisService.refreshSession(userId, sessionId, ttl);
  }

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
