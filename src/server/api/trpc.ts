/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { TRPCError, initTRPC } from "@trpc/server";
import { cookies } from "next/headers";
import { type NextRequest } from "next/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { prisma } from "~/server/db";
import { decodeJwt, isTokenExpired } from "../auth/jwt";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

interface CreateContextOptions {
  headers: Headers;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    headers: opts.headers,
    db: prisma,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = (opts: { req: NextRequest }) => {
  // Fetch stuff that depends on the request

  return createInnerTRPCContext({
    headers: opts.req.headers,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

export const middleware = t.middleware;

// The middleware that gets the auth tokens from the cookies, and decodes and adds them to the context.
const decodeTokensMiddleware = middleware(({ ctx, next }) => {
  // Get auth tokens from the cookies.
  const accessToken = cookies().get("access-token")?.value;
  const refreshToken = cookies().get("refresh-token")?.value;

  // Decode the tokens.
  // Note that they might not be present in the cookies. In that case, their decoded versions will be `null`.
  const decodedAccessToken = decodeJwt(accessToken ?? "");
  const decodedRefreshToken = decodeJwt(refreshToken ?? "");

  // Add the decoded tokens into the context, and continue with the next middleware/prodecure.
  return next({
    ctx: {
      ...ctx,
      accessToken: { raw: accessToken, decoded: decodedAccessToken },
      refreshToken: { raw: refreshToken, decoded: decodedRefreshToken },
    },
  });
});

// The middleware that verifies the access token, and determines whether the user is authorized (signed in).
const authorizedMiddleware = decodeTokensMiddleware.unstable_pipe(
  async ({ ctx, next }) => {
    const { raw: rawAccessToken, decoded: decodedAccessToken } =
      ctx.accessToken;

    // The token must be provided. If not, it means the user is not authorized.
    if (!rawAccessToken)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Access token not provided",
      });

    // Find the session with the provided token.
    const session = await ctx.db.session.findFirst({
      where: { accessToken: rawAccessToken },
    });

    // This is the second reason to block: no session with that token.
    if (!session)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid access token",
      });

    /*
    Now for the third and the final check, check the expiration date.
    If the token has been expired, block the user access.
  */

    // Check if the expiration date has past.
    if (!decodedAccessToken || isTokenExpired(decodedAccessToken)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Access token expired",
      });
    }

    // Everything is fine. Redirect to the actual route while adding the access token to the context.
    // Note: It's actually so dope that the context can be modified!
    return next({ ctx: { user: decodedAccessToken.user } });
  },
);

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

// Decode tokens and pass them to the context beforehand.
export const publicProcedureWithTokens = publicProcedure.use(
  decodeTokensMiddleware,
);

// A procedure that requires the user to be authorized.
export const authorizedProcedure = publicProcedure.use(authorizedMiddleware);
