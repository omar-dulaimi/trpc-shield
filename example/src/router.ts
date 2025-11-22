import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { Context } from './context';
import { permissions } from './permissions';

const t = initTRPC.context<Context>().create();
const shieldMiddleware = t.middleware(permissions);
const procedure = t.procedure;
const protectedProcedure = procedure.use(shieldMiddleware);
const router = t.router;

const userInput = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

const userRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 25,
    });
  }),
  byId: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findUnique({
        where: { id: input.id },
      });
    }),
  create: protectedProcedure
    .input(userInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.create({
        data: input,
      });
    }),
});

export const appRouter = router({
  user: userRouter,
});

export type AppRouter = typeof appRouter;
