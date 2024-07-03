import { Types } from 'mongoose';
import { z } from 'zod';

const author = z
  .object({
    _id: z.custom<Types.ObjectId>(),
    name: z.string(),
    profile_img: z.string().optional(),
  })
  .required();

type Author = z.infer<typeof author>;

export { author };
export type { Author };
