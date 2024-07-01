import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Types } from 'mongoose';
import { AbstractDocument } from '@app/common';
// import { User } from './user.schema';

@Schema({ timestamps: true })
export class UserPost extends AbstractDocument {
  @Prop({ required: true })
  content: string;

  // @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  // user: User;
}

export const UserPostSchema = SchemaFactory.createForClass(UserPost);
