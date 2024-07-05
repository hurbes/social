import { z } from 'zod';
import { author } from '../author/auth.schema';
import { Types } from 'mongoose';

const createCommentRequestSchema = z.object({
  post_id: z.custom<Types.ObjectId>().optional(),
  content: z.string().min(1).max(256),
  author: author.optional(),
});

type CreateCommentRequest = z.infer<typeof createCommentRequestSchema>;

export { createCommentRequestSchema };
export type { CreateCommentRequest };
