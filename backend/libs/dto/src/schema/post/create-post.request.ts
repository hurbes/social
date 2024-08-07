import { z } from 'zod';
import { author } from '../author/auth.schema';

const createPostRequestSchema = z.object({
  title: z.string(),
  content: z.string(),
  author: author.optional(),
  comment_count: z.number().default(0),
  like_count: z.number().default(0),
  trending_points: z.number().default(0),
  is_edited: z.boolean().default(false),
  is_deleted: z.boolean().default(false),
});

type CreatePostRequest = z.infer<typeof createPostRequestSchema>;

export { createPostRequestSchema };
export type { CreatePostRequest };
