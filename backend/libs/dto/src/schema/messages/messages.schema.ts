import { z } from 'zod';
import { author } from '../author/auth.schema';

const userMessageResponseSchema = z
  .object({
    _id: z.string(),
    content: z.string(),
    sender: author,
    receiver: author,
    is_read: z.boolean().default(false),
    // createdAt: z.date().default(() => new Date()),
    // updatedAt: z.date().default(() => new Date()),
  })
  .required();

type UserMessageSchemaResponse = z.infer<typeof userMessageResponseSchema>;

export { userMessageResponseSchema };
export type { UserMessageSchemaResponse };
