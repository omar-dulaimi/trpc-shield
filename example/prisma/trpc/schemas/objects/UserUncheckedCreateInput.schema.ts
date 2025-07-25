import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.UserUncheckedCreateInput> = z
  .object({
    id: z.number().optional(),
    createdAt: z.coerce.date().optional(),
    username: z.string().optional().nullable(),
    password: z.string().optional().nullable(),
    email: z.string(),
    googleId: z.string().optional().nullable(),
  })
  .strict();

export const UserUncheckedCreateInputObjectSchema = Schema;
