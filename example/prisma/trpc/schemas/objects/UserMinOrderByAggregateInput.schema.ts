import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: SortOrderSchema.optional(),
    createdAt: SortOrderSchema.optional(),
    username: SortOrderSchema.optional(),
    password: SortOrderSchema.optional(),
    email: SortOrderSchema.optional(),
    googleId: SortOrderSchema.optional(),
  })
  .strict();

export const UserMinOrderByAggregateInputObjectSchema = Schema;
