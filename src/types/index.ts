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
