import { Types } from 'mongoose';
import { z } from 'zod';
import { author } from '../author/auth.schema';

const commentResponseSchema = z.object({
  _id: z.custom<Types.ObjectId>(),
  post_id: z.custom<Types.ObjectId>(),
  content: z.string(),
  author: author,
  is_edited: z.boolean().default(false),
  is_deleted: z.boolean().default(false),
  like_count: z.number().default(0),
  createdAt: z.string().pipe(z.coerce.date()),
  updatedAt: z.string().pipe(z.coerce.date()),
});

type CommentResponse = z.infer<typeof commentResponseSchema>;

export { commentResponseSchema };
export type { CommentResponse };
