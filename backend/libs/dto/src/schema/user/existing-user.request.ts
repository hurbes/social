import { z } from 'zod';
import { passwordField } from './create-user.request';

export const existingUserRequest = z.object({
  email: z.string().email(),
  password: passwordField,
});

export type ExistingUserRequest = z.infer<typeof existingUserRequest>;
