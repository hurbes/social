import { z } from 'zod';
import { Types } from 'mongoose';

const userResponseSchema = z.object({
  _id: z.custom<Types.ObjectId>(),
  email: z.string(),
  name: z.string(),
  profile_img: z.string().optional(),
});

type UserResponse = z.infer<typeof userResponseSchema>;

export { userResponseSchema };
export type { UserResponse };
