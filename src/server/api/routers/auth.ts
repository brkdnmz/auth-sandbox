import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { env } from "~/env.mjs";
import { sendVerificationEmail } from "~/server/auth/email-verification";
import { generateJwt } from "~/server/auth/jwt";
import {
  pendingEmailVerifications,
  sessions,
  users,
} from "~/server/db/schema-sqlite";
import {
  signinFormSchema,
  signupFormSchema,
  verificationCodeSchema,
} from "~/types";
import {
  authorizedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "../trpc";

// Possible authentication errors are defined with an enum.
//? Okay, maybe this is not so crucial after all, I don't know :D
export enum AuthError {
  SIGNUP_EMAIL_REGISTERED = "SIGNUP_EMAIL_REGISTERED",
  SIGNUP_INVALID_EMAIL_VERIFICATION_CODE = "SIGNUP_INVALID_VERIFICATION_CODE",
  SIGNIN_INVALID_CREDENTIALS = "SIGNIN_INVALID_CREDENTIALS",
}

// Authentication API that manages signins and signups.
export const authRouter = createTRPCRouter({
  // This route handles the entire signup process.
  // Creates a new user, generates a verification code and sends a verification email involving the code.
  signUp: publicProcedure
    .input(signupFormSchema)
    .mutation(async ({ ctx, input }) => {
      // Find the user with the same email (if any).
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      // User exists, cannot sign up an already-registered user.
      if (user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          cause: AuthError.SIGNUP_EMAIL_REGISTERED,
          message: "This email has already been registered",
        });
      }

      /*
        User does not exist, which means it may sign up:
          1- Create a new user.
          2- Generate a unique verification code, and save it in the database.
      */

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

      // A new user will be created AND the verification code will be saved in `pending_email_verifications`.
      // This is why a transaction is used: there are multiple writes -- either both or none should succeed.
      await ctx.db.transaction(async (tx) => {
        // Create a new user with the given credentials.
        //! `returning` does not work for MySQL: https://orm.drizzle.team/docs/insert#insert-returning
        // It returns an array of insertions. Since we insert a single user, it's the first element.
        // Also, the non-null assertion operator `!` is used because it won't be null.
        const newUser = (
          await tx
            .insert(users)
            .values({
              email: input.email,
              username: input.username,
              password: input.password,
              fullName: input.fullName,
            })
            .returning()
        )[0]!;

        // Save the verification code.
        await tx
          .insert(pendingEmailVerifications)
          .values({ verificationCode, userId: newUser.id });
      });

      // Lastly, send the verification email to the user's email address.
      // A link in this email will redirect the user to the following URL:
      //   http://<server host>:<server port>/auth/verify-email/:verificationCode
      // E.g.:
      //   http://localhost:3000/auth/verify-email/ebe35bb2-f1fd-4512-beb4-8676623da204
      return sendVerificationEmail({
        to: input.email,
        username: input.username,
        verificationCode: verificationCode,
        redirect: `http://${env.NEXT_HOST}:${env.NEXT_PORT}/auth/verify-email`,
      });
    }),

  // This route verifies the corresponding user's email with the provided verification code.
  verifyEmail: publicProcedure
    .input(z.object({ verificationCode: verificationCodeSchema }))
    .query(async ({ ctx, input }) => {
      // Firstly, find the pending verification corresponding to the provided verification code.
      const pendingEmailVerification =
        await ctx.db.query.pendingEmailVerifications.findFirst({
          where: eq(
            pendingEmailVerifications.verificationCode,
            input.verificationCode,
          ),
          // Also return the user (thanks to the relations defined in the schema file).
          with: {
            user: true,
          },
        });

      // If there is no such pending verification, then the code must be invalid.
      if (!pendingEmailVerification) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          cause: AuthError.SIGNUP_INVALID_EMAIL_VERIFICATION_CODE,
          message: "Verification code is invalid",
        });
      }

      const verifiedUser = pendingEmailVerification.user;

      // The code is valid, so, verify the user and delete the pending verification.
      // Multiple updates -> transaction!
      await ctx.db.transaction(async (tx) => {
        // Verify the user.
        // Either pendingEmailVerification.userId or verifiedUser.id can be used.
        await tx
          .update(users)
          .set({ isVerified: true })
          .where(eq(users.id, verifiedUser.id));

        // Delete the pending verification.
        await tx
          .delete(pendingEmailVerifications)
          .where(
            eq(
              pendingEmailVerifications.verificationCode,
              input.verificationCode,
            ),
          );
      });

      // Return the user that has been verified.
      return pendingEmailVerification.user;
    }),

  // The route that handles signing in.
  signIn: publicProcedure
    .input(signinFormSchema)
    .mutation(async ({ ctx, input }) => {
      // Find the user with the given credentials.
      const user = await ctx.db.query.users.findFirst({
        where: (users, { and, or, eq }) =>
          and(
            or(
              eq(users.email, input.emailOrUsername),
              eq(users.username, input.emailOrUsername),
            ),
            eq(users.password, input.password),
          ),
      });

      // Such user does not exist, may not sign in.
      if (!user)
        throw new TRPCError({
          code: "BAD_REQUEST",
          cause: AuthError.SIGNIN_INVALID_CREDENTIALS,
          message: "Invalid email/username or password",
        });

      // Generate the access and refresh tokens, and return them.
      //! Refresh token is currently unused in the application.
      const accessToken = generateJwt(user, 1 * 60); // 1 minutes
      const refreshToken = generateJwt(user, 30 * 24 * 60 * 60); // 1 month

      // Record the session into the database.
      // TODO A signed-in user should not be able to sign in again.
      await ctx.db
        .insert(sessions)
        .values({ accessToken, refreshToken, userId: user.id });

      return { accessToken, refreshToken };
    }),

  // The route that handles signing out.
  signOut: authorizedProcedure.mutation(async ({ ctx }) => {
    // Just delete the corresponding session from the database, that's it.
    // Thanks to that, the same access token cannot be used to authorize.
    return ctx.db
      .delete(sessions)
      .where(eq(sessions.userId, ctx.accessToken.user.id));
  }),

  // Get the session details (current user).
  getSession: authorizedProcedure.query(({ ctx }) => {
    return ctx.accessToken;
  }),
});
