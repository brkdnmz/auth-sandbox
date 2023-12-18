import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { z } from "zod";
import { env } from "~/env.mjs";
import { sendVerificationEmail } from "~/server/auth/email-verification";
import { generateJwt, isTokenExpired } from "~/server/auth/jwt";
import { signinFormSchema, signupFormSchema } from "~/types";
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
      const user = await ctx.db.user.findFirst({
        where: { email: input.email },
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
        await ctx.db.pendingEmailVerification.findFirst({
          where: { verificationCode },
        })
      ) {
        verificationCode = randomUUID();
      }

      // Encrypt the password to store it safely in the database.
      //! Do not store the plain password!
      const encryptedPassword = bcrypt.hashSync(input.password, 10);

      // A new user will be created AND the verification code will be saved in `pending_email_verifications`.
      // This is why a transaction is used: there are multiple writes -- either both or none should succeed.
      await ctx.db.$transaction(async (tx) => {
        // Create a new user with the given credentials.
        await tx.user.create({
          data: {
            email: input.email,
            username: input.username,
            password: encryptedPassword,
            fullName: input.fullName,
            pendingEmailVerification: { create: { verificationCode } },
          },
        });

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
    .input(z.object({ verificationCode: z.string() }))
    .query(async ({ ctx, input }) => {
      // Firstly, find the pending verification corresponding to the provided verification code.
      const pendingEmailVerification =
        await ctx.db.pendingEmailVerification.findFirst({
          where: { verificationCode: input.verificationCode },
          // Also return the user.
          include: { unverifiedUser: true },
        });

      // If there is no such pending verification, then the code must be invalid.
      if (!pendingEmailVerification) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          cause: AuthError.SIGNUP_INVALID_EMAIL_VERIFICATION_CODE,
          message: "Verification code is invalid",
        });
      }

      const unverifiedUser = pendingEmailVerification.unverifiedUser;

      // Delete the pending email verification (the user has been verified).
      await ctx.db.pendingEmailVerification.delete({
        where: { verificationCode: input.verificationCode },
      });

      // Return the user that has been verified.
      return unverifiedUser;
    }),

  // The route that handles signing in.
  signIn: publicProcedure
    .input(signinFormSchema)
    .mutation(async ({ ctx, input }) => {
      // Find the user with the email/username.
      //? Since the stored password is encrypted, we don't add an additional password equality filter.
      const user = await ctx.db.user.findFirst({
        where: {
          OR: [
            { email: input.emailOrUsername },
            { username: input.emailOrUsername },
          ],
        },
      });

      // Check if the password matches the actual encrypted password.
      //? Note that even the email/username might be invalid, and thus, the user might not exist.
      const isPasswordCorrect =
        user && bcrypt.compareSync(input.password, user.password);

      // Such user does not exist, or the password is incorrect; may not sign in.
      if (!user || !isPasswordCorrect)
        throw new TRPCError({
          code: "BAD_REQUEST",
          cause: AuthError.SIGNIN_INVALID_CREDENTIALS,
          message: "Invalid email/username or password",
        });

      // Generate the access and refresh tokens, and return them.
      const accessToken = generateJwt(user, env.ACCESS_TOKEN_DURATION);
      const refreshToken = generateJwt(user, env.REFRESH_TOKEN_DURATION);

      // Record the session into the database.
      // TODO A signed-in user should not be able to sign in again. (Or is it not a problem?)
      await ctx.db.session.upsert({
        where: { userId: user.id },
        create: { accessToken, refreshToken, userId: user.id },
        update: { accessToken, refreshToken },
      });

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
    return ctx.db.session.delete({ where: { userId } });
  }),

  // Get the session details (current user).
  getSession: authorizedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  // Refresh the session using the refresh token, e.g. in case if the access token has been expired.
  refreshSession: publicProcedureWithTokens.mutation(async ({ ctx }) => {
    // Get the refresh token from the context.
    //? Note the prodecure used.
    const { raw: rawRefreshToken, decoded: decodedRefreshToken } =
      ctx.refreshToken;

    // Self-explanatory, isn't it? :)
    if (!rawRefreshToken) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Refresh token not provided",
      });
    }

    // Find the session with the provided refresh token.
    const session = await ctx.db.session.findFirst({
      where: { refreshToken: rawRefreshToken },
      include: { user: true },
    });

    // The session isn't present in the database, which should mean that the refresh token is invalid.
    if (!session) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid refresh token",
      });
    }

    // The refresh token has been expired.
    if (!decodedRefreshToken || isTokenExpired(decodedRefreshToken)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Refresh token expired",
      });
    }

    // Regenerate both the access and refresh tokens.
    const newAccessToken = generateJwt(session.user, env.ACCESS_TOKEN_DURATION);
    const newRefreshToken = generateJwt(
      session.user,
      env.REFRESH_TOKEN_DURATION,
    );

    // Refresh the session.
    await ctx.db.session.update({
      where: { userId: session.userId },
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });

    // Return new tokens.
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }),
});
