import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { pendingEmailVerifications, users } from "~/server/db/schema-mysql";

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

export type User = typeof users.$inferSelect;

export const verificationCodeSchema = createSelectSchema(
  pendingEmailVerifications,
).shape.verificationCode;

export const sessionUserSchema = createSelectSchema(users).pick({
  id: true,
  email: true,
  username: true,
  fullName: true,
  isVerified: true,
});

export const authTokenSchema = z.object({
  iat: z.number(),
  exp: z.number(),
  user: sessionUserSchema,
});

export type SessionUser = z.infer<typeof sessionUserSchema>;
export type AuthToken = z.infer<typeof authTokenSchema>;
