import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AbstractDocument } from '@app/common';
import { User } from './user.schema';
import { UserPost } from './post.schema';

@Schema({ timestamps: true })
export class Comment extends AbstractDocument {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Pick<User, '_id' | 'name'>;

  post: Pick<UserPost, '_id'>;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
