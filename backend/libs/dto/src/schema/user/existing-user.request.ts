import { z } from 'zod';
import { passwordField } from './create-user.request';

export const existingUserRequest = z.object({
  email: z.string().email(),
  password: passwordField,
  profile_img: z.string().optional(),
});

export type ExistingUserRequest = z.infer<typeof existingUserRequest>;
