import { eq } from "drizzle-orm";
import { sendVerificationEmail } from "~/server/auth/email-verification";
import { users } from "~/server/db/schema-sqlite";
import { signupFormSchema } from "~/types";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(signupFormSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });
      if (!user)
        return sendVerificationEmail({
          to: input.email,
          username: input.username,
          verificationCode: "23532",
          redirect: "http://localhost:3000",
        });
    }),
});
