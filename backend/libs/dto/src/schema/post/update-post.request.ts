import { Types } from 'mongoose';
import { z } from 'zod';

const updatePostRequestSchema = z
  .object({
    _id: z.custom<Types.ObjectId>(),
    title: z.string().optional(),
    content: z.string().optional(),
  })
  .required();

type UpdatePostRequest = z.infer<typeof updatePostRequestSchema>;

export { updatePostRequestSchema };
export type { UpdatePostRequest };
