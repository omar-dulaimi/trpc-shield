import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import * as trpc from '@trpc/server';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaBetterSqlite3({
  url: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

export const createContext = ({ req }: CreateExpressContextOptions) => {
  const roleHeader = Array.isArray(req.headers['x-user-role'])
    ? req.headers['x-user-role'][0]
    : req.headers['x-user-role'];

  const idHeader = Array.isArray(req.headers['x-user-id'])
    ? req.headers['x-user-id'][0]
    : req.headers['x-user-id'];

  const role = roleHeader === 'admin' ? 'admin' : 'user';
  const user =
    idHeader !== undefined
      ? {
          id: Number.parseInt(idHeader, 10),
          role,
        }
      : null;

  return {
    prisma,
    user,
  };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
