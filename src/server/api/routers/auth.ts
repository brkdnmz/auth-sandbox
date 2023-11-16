import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { env } from "~/env.mjs";
import { sendVerificationEmail } from "~/server/auth/email-verification";
import { pendingEmailVerifications, users } from "~/server/db/schema-sqlite";
import { signupFormSchema, verificationCodeSchema } from "~/types";
import { createTRPCRouter, publicProcedure } from "../trpc";

// Possible authentication errors are defined with an enum
export enum AuthError {
  SIGNUP_EMAIL_REGISTERED = "SIGNUP_EMAIL_REGISTERED",
  SIGNUP_INVALID_EMAIL_VERIFICATION_CODE = "SIGNUP_INVALID_VERIFICATION_CODE",
}

// Authentication API that manages sign-ins and sign-ups.
export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(signupFormSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      // User exists, cannot sign up
      if (user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          cause: AuthError.SIGNUP_EMAIL_REGISTERED,
          message: "This email has already been registered",
        });
      }

      // User doesn't exist, creating a new user
      //! `returning` does not work for MySQL: https://orm.drizzle.team/docs/insert#insert-returning
      // It returns an array of insertions. Since we insert a single user, it's the first element.
      // Also, the non-null assertion operator `!` is used because it won't be null.
      const newUser = (
        await ctx.db
          .insert(users)
          .values({
            email: input.email,
            username: input.username,
            password: input.password,
            fullName: input.fullName,
          })
          .returning()
      )[0]!;

      // Create a unique verification code (create a new code until it's unique).
      // It's very unlikely that an existing code gets created again, but being safe is nice.
      let verificationCode = randomUUID();
      while (
        await ctx.db.query.pendingEmailVerifications.findFirst({
          where: eq(
            pendingEmailVerifications.verificationCode,
            verificationCode,
          ),
        })
      ) {
        verificationCode = randomUUID();
      }

      await ctx.db
        .insert(pendingEmailVerifications)
        .values({ verificationCode, userId: newUser.id });

      return sendVerificationEmail({
        to: input.email,
        username: input.username,
        verificationCode: verificationCode,
        redirect: `http://${env.NEXT_HOST}:${env.NEXT_PORT}/auth/verify-email`,
      });
    }),

  getVerifyingUser: publicProcedure
    .input(z.object({ verificationCode: verificationCodeSchema }))
    .query(async ({ ctx, input }) => {
      const pendingEmailVerification =
        await ctx.db.query.pendingEmailVerifications.findFirst({
          where: eq(
            pendingEmailVerifications.verificationCode,
            input.verificationCode,
          ),
          with: {
            user: true,
          },
        });

      if (!pendingEmailVerification) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          cause: AuthError.SIGNUP_INVALID_EMAIL_VERIFICATION_CODE,
          message: "Verification code is invalid",
        });
      }

      return pendingEmailVerification.user;
    }),
});
