import { Controller, Inject } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import { CommentService } from './comment.service';
import { SharedService } from '@app/common';
import { CreateCommentRequest, UpdateCommentRequest } from '@app/dto';

@Controller()
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
  ) {}

  @MessagePattern({ cmd: 'comments' })
  getComments(@Ctx() context: RmqContext, @Payload() post: string) {
    this.sharedService.acknowledgeMessage(context);

    return this.commentService.getComments(post);
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
    @Payload() comment: { id: string; author_id: string },
  ): Promise<boolean> {
    this.sharedService.acknowledgeMessage(context);
    return this.commentService.deleteComment(comment.id, comment.author_id);
  }
}
