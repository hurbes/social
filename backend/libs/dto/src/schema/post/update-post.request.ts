import { Types } from 'mongoose';
import { z } from 'zod';
import { author } from '../author/auth.schema';

const updatePostRequestSchema = z.object({
  _id: z.custom<Types.ObjectId>().optional(),
  author: author.optional(),
  title: z.string().optional(),
  content: z.string().optional(),
});

type UpdatePostRequest = z.infer<typeof updatePostRequestSchema>;

export { updatePostRequestSchema };
export type { UpdatePostRequest };
