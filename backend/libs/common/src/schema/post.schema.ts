import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AbstractDocument } from '@app/common';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class UserPost extends AbstractDocument {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Pick<User, '_id' | 'name' | 'profile_img'>;

  @Prop({ default: 0 })
  comment_count: number;

  @Prop({ default: 0 })
  like_count: number;

  @Prop({ default: 0 })
  trending_points: number;

  @Prop({ default: false })
  is_edited: boolean;

  @Prop({ default: false })
  is_deleted: boolean;
}

export const UserPostSchema = SchemaFactory.createForClass(UserPost);
