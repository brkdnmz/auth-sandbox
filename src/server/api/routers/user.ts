import { authorizedProcedure, createTRPCRouter } from "../trpc";

export const userRouter = createTRPCRouter({
  getAll: authorizedProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        pendingEmailVerification: true,
        createdAt: true,
      },
      orderBy: [{ id: "asc" }],
    });
  }),
});
