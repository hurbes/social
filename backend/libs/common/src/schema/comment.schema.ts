import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AbstractDocument, User } from '@app/common';

@Schema({ timestamps: true })
export class PostComment extends AbstractDocument {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Pick<User, '_id' | 'name' | 'profile_img'>;

  @Prop({ type: Types.ObjectId, ref: 'UserPost', required: true })
  post_id: Types.ObjectId;

  @Prop({ default: false })
  is_edited: boolean;

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ default: 0 })
  like_count: number;
}

export const PostCommentSchema = SchemaFactory.createForClass(PostComment);
