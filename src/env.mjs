import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NEXT_HOST: z.string(),
    NEXT_PORT: z.string(),
    DB_HOST: z.string(),
    DB_PORT: z.coerce.number(),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),
    GMAIL_ACCOUNT_EMAIL_ADDRESS: z.string(),
    GMAIL_APP_PASSWORD: z.string(),
    ACCESS_TOKEN_DURATION: z.coerce.number(),
    REFRESH_TOKEN_DURATION: z.coerce.number(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NEXT_HOST: process.env.NEXT_HOST,
    NEXT_PORT: process.env.NEXT_PORT,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    GMAIL_ACCOUNT_EMAIL_ADDRESS: process.env.GMAIL_ACCOUNT_EMAIL_ADDRESS,
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
    ACCESS_TOKEN_DURATION: process.env.ACCESS_TOKEN_DURATION,
    REFRESH_TOKEN_DURATION: process.env.REFRESH_TOKEN_DURATION,
    NODE_ENV: process.env.NODE_ENV,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
