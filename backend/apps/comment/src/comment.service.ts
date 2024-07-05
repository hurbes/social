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

  async getComments(post_id: string): Promise<CommentResponse[]> {
    const response = await this.commentRepository.find({ post_id });
    return response.map((comment) => commentResponseSchema.parse(comment));
  }

  async updateComment(comment: UpdateCommentRequest) {
    const response = await this.commentRepository.upsert(
      comment as PostComment,
      {
        _id: comment._id,
      },
    );

    return commentResponseSchema.parse(response);
  }

  async deleteComment(comment_id: string): Promise<void> {
    await this.commentRepository.delete({ _id: comment_id });
  }

  async likeComment() {
    return 'Like a comment';
  }

  async unlikeComment() {
    return 'Unlike a comment';
  }
}
