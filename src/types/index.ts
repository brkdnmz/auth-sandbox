import { type User } from "@prisma/client";
import { z } from "zod";

export const signupFormSchema = z.object({
  email: z
    .string()
    .email("Not a valid email")
    .max(150, "Email length must be at most 150"),
  username: z
    .string()
    .min(1, "Username must not be empty")
    .max(100, "Username length must be at most 100"),
  fullName: z
    .string()
    .max(100, "Full name length must be at most 100")
    .optional(),
  password: z
    .string()
    .min(1, "Password must not be empty")
    .max(100, "Password length must be at most 100"),
});

export type SignupForm = z.infer<typeof signupFormSchema>;

export const signinFormSchema = z.object({
  emailOrUsername: signupFormSchema.shape.email.or(
    signupFormSchema.shape.username,
  ),
  password: signupFormSchema.shape.password,
});

export type SigninForm = z.infer<typeof signinFormSchema>;

export type UserModel = User;

export const sessionUserSchema = z.object({
  id: z.number(),
  email: z.string().max(150),
  username: z.string().max(100),
  fullName: z.string().max(100).nullish(),
  createdAt: z.coerce.date(),
});

export const authTokenSchema = z.object({
  iat: z.number(),
  exp: z.number(),
  user: sessionUserSchema,
});

export type SessionUser = z.infer<typeof sessionUserSchema>;
export type AuthToken = z.infer<typeof authTokenSchema>;
