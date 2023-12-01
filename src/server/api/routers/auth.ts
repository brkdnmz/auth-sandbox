import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { env } from "~/env.mjs";
import { sendVerificationEmail } from "~/server/auth/email-verification";
import { generateJwt, isTokenExpired } from "~/server/auth/jwt";
import {
  pendingEmailVerifications,
  sessions,
  users,
} from "~/server/db/schema-mysql";
import {
  signinFormSchema,
  signupFormSchema,
  verificationCodeSchema,
} from "~/types";
import {
  authorizedProcedure,
  createTRPCRouter,
  publicProcedure,
  publicProcedureWithTokens,
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
        // It returns an array of the IDs of the inserted users. Since we insert a single user, it's the first element.
        //? Previously, I used SQLite which allows the usage of the `returning` method, which returns the inserted user.
        //? However, `returning` does not work for MySQL: https://orm.drizzle.team/docs/insert#insert-returning
        const newUserId = (
          await tx.insert(users).values({
            email: input.email,
            username: input.username,
            password: input.password,
            fullName: input.fullName,
          })
        )[0].insertId;

        // Get the inserted user.
        //? The non-null assertion operator `!` is used because it won't be null.
        const newUser = (await tx.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, newUserId),
        }))!;

        // Save the verification code.
        await tx
          .insert(pendingEmailVerifications)
          .values({ verificationCode, userId: newUser.id });

        //? We are sending the email inside the transaction so that if an error occurs, all changes will be rolled back.

        // Now, send the verification email to the user's email address.
        // A link in this email will redirect the user to the following URL:
        //   http://<server host>:<server port>/auth/verify-email/:verificationCode
        // E.g.:
        //   http://localhost:3000/auth/verify-email/ebe35bb2-f1fd-4512-beb4-8676623da204
        await sendVerificationEmail({
          to: input.email,
          username: input.username,
          verificationCode: verificationCode,
          redirect: `http://${env.NEXT_HOST}:${env.NEXT_PORT}/auth/verify-email`,
        });
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
      const accessToken = generateJwt(user, env.ACCESS_TOKEN_DURATION);
      const refreshToken = generateJwt(user, 30 * 24 * 60 * 60); // 1 month

      // Record the session into the database.
      // TODO A signed-in user should not be able to sign in again.
      await ctx.db
        .insert(sessions)
        .values({ accessToken, refreshToken, userId: user.id });

      return { accessToken, refreshToken };
    }),

  // The route that handles signing out.
  signOut: publicProcedureWithTokens.mutation(async ({ ctx }) => {
    /*
      Get the user's ID who requested signout from the access token. Then, delete the session with the same user ID from the database.

      This procedure ignores whether:
        1- The user ID is provided
        2- The session exists in the database
    */
    const userId = ctx.accessToken.decoded?.user.id;

    // This might happen if the access token is not provided, the token is invalid.
    // Well, do nothing if this is the case.
    if (userId === undefined) return;

    // Just delete the corresponding session from the database, that's it.
    // Thanks to that, the same access token cannot be used to authorize (or the refresh token to obtain new tokens).
    return ctx.db.delete(sessions).where(eq(sessions.userId, userId));
  }),

  // Get the session details (current user).
  getSession: authorizedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  refreshSession: publicProcedureWithTokens.mutation(async ({ ctx }) => {
    const { raw: rawRefreshToken, decoded: decodedRefreshToken } =
      ctx.refreshToken;

    if (!rawRefreshToken) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Refresh token not provided",
      });
    }

    // Find the session with the provided refresh token.
    const session = await ctx.db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.refreshToken, rawRefreshToken),
      with: { user: true },
    });

    if (!session) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid refresh token",
      });
    }

    if (!decodedRefreshToken || isTokenExpired(decodedRefreshToken)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Refresh token expired",
      });
    }

    const newAccessToken = generateJwt(session.user, env.ACCESS_TOKEN_DURATION);
    const newRefreshToken = generateJwt(session.user, 30 * 24 * 60 * 60); // 1 month

    await ctx.db
      .update(sessions)
      .set({ accessToken: newAccessToken, refreshToken: newRefreshToken })
      .where(eq(sessions.userId, session.userId));

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }),
});
