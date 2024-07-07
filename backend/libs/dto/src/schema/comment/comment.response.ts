import { Types } from 'mongoose';
import { z } from 'zod';
import { author } from '../author/auth.schema';

const commentResponseSchema = z.object({
  _id: z.custom<Types.ObjectId>(),
  post_id: z.custom<Types.ObjectId>(),
  content: z.string(),
  author: author.optional(),
  is_edited: z.boolean().default(false),
  is_deleted: z.boolean().default(false),
  like_count: z.number().default(0),
  createdAt: z.any(),
  updatedAt: z.any(),
});

type CommentResponse = z.infer<typeof commentResponseSchema>;

export { commentResponseSchema };
export type { CommentResponse };
