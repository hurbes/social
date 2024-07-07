import { Injectable } from '@nestjs/common';
import { CommentRepository } from './repository/comment.repository';
import { PostComment } from '@app/common';
import {
  CommentResponse,
  commentResponseSchema,
  CreateCommentRequest,
  UpdateCommentRequest,
} from '@app/dto';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  async createComment(comment: CreateCommentRequest): Promise<CommentResponse> {
    const response = await this.commentRepository.create(
      comment as PostComment,
    );
    return commentResponseSchema.parse(response);
  }

  async getComments(post: {
    post_id: string;
    startScore: number;
    endScore: number;
    pageSize: number;
  }): Promise<CommentResponse[]> {
    const response = await this.commentRepository.find({
      filterQuery: {
        post_id: post.post_id,
        createdAt: {
          $gte: new Date(post.startScore * 1000),
          $lte: new Date(post.endScore * 1000),
        },
      },
      limit: post.pageSize,
      sort: { createdAt: -1 },
    });
    return response.map((comment) => commentResponseSchema.parse(comment));
  }

  async updateComment(comment: UpdateCommentRequest): Promise<CommentResponse> {
    const response = await this.commentRepository.upsert(
      {
        _id: comment._id,
        'author._id': comment.author_id,
      },
      { content: comment.content },
    );

    return commentResponseSchema.parse(response);
  }

  async deleteComment(comment_id: string, author_id: string): Promise<boolean> {
    return this.commentRepository.delete({
      _id: comment_id,
      'author._id': author_id,
    });
  }
}
