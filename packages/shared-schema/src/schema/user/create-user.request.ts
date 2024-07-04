import { z } from 'zod';

const passwordValidation = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
);

export const passwordField = z.string().refine(function (data) {
  return passwordValidation.test(data);
}, 'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long');

export const createUserSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    password: passwordField,
    confirmPassword: passwordField,
    profile_img: z.string().optional(),
  })
  .required()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['confirmPassword'],
      });
    }
  });

export type CreateUserRequest = z.infer<typeof createUserSchema>;
