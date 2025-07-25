import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    username: z.boolean().optional(),
    password: z.boolean().optional(),
    email: z.boolean().optional(),
    googleId: z.boolean().optional(),
  })
  .strict();

export const UserSelectObjectSchema = Schema;
