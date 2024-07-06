import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AbstractDocument, User } from '@app/common';

@Schema({ timestamps: true })
export class UserMessage extends AbstractDocument {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Pick<User, '_id' | 'name' | 'profile_img'>;

  @Prop({ type: Types.ObjectId, ref: 'UserPost', required: true })
  receiver: Types.ObjectId;

  @Prop({ default: false })
  is_read: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(UserMessage);
