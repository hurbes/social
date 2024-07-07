import { Types } from 'mongoose';
import { z } from 'zod';

const updateCommentRequestSchema = z.object({
  _id: z.custom<Types.ObjectId>().optional(),
  author_id: z.custom<Types.ObjectId>().optional(),
  content: z.string().min(1).max(265),
});

type UpdateCommentRequest = z.infer<typeof updateCommentRequestSchema>;

export { updateCommentRequestSchema };
export type { UpdateCommentRequest };
