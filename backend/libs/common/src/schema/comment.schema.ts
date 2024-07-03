import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ timestamps: true })
export class Comment extends AbstractDocument {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: string;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  post: string;

  @Prop({ default: false })
  is_edited: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
