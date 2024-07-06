import { Types } from 'mongoose';
import { z } from 'zod';

function getRandomAvatarUri(style = 'micah') {
  const seed = Math.random().toString();
  return `https://api.dicebear.com/6.x/${style}/svg?seed=${seed}`;
}
const author = z.object({
  _id: z.custom<Types.ObjectId>(),
  name: z.string(),
  profile_img: z
    .string()
    .default(() => getRandomAvatarUri())
    .optional(),
});

type Author = z.infer<typeof author>;

export { author };
export type { Author };
