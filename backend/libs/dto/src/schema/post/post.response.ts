import { Types } from 'mongoose';
import { z } from 'zod';
import { author } from '../author/auth.schema';

const postResponseSchema = z
  .object({
    _id: z.custom<Types.ObjectId>(),
    title: z.string(),
    content: z.string(),
    author: author,
    comment_count: z.number(),
    like_count: z.number(),
    createdAt: z.any(),
    updatedAt: z.any(),
    is_edited: z.boolean(),
    is_deleted: z.boolean(),
  })
  .required();

type PostResponse = z.infer<typeof postResponseSchema>;

export { postResponseSchema };
export type { PostResponse };
