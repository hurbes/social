import { Controller, Inject } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import { CommentService } from './comment.service';
import { SharedService } from '@app/common';
import { CreateCommentRequest } from '@app/dto/schema/comment/create-comment.request';
import { UpdateCommentRequest } from '@app/dto/schema/comment/update-comment.request';

@Controller()
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
  ) {}

  @MessagePattern({ cmd: 'comments' })
  getComments(
    @Ctx() context: RmqContext,
    @Payload() post: { post_id: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.commentService.getComments(post.post_id);
  }

  @MessagePattern({ cmd: 'add-comment' })
  createComment(
    @Ctx() context: RmqContext,
    @Payload() comment: CreateCommentRequest,
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.commentService.createComment(comment);
  }

  @MessagePattern({ cmd: 'update-comment' })
  updateComment(
    @Ctx() context: RmqContext,
    @Payload() comment: UpdateCommentRequest,
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.commentService.updateComment(comment);
  }

  @MessagePattern({ cmd: 'delete-comment' })
  deleteComment(
    @Ctx() context: RmqContext,
    @Payload() post: { post_id: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.commentService.deleteComment(post.post_id);
  }

  @MessagePattern({ cmd: 'like-comment' })
  likeComment(
    @Ctx() context: RmqContext,
    //  @Payload() post: { post_id: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.commentService.likeComment();
  }

  @MessagePattern({ cmd: 'unlike-comment' })
  unlikeComment(
    @Ctx() context: RmqContext,
    //   @Payload() post: { post_id: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.commentService.unlikeComment();
  }
}
