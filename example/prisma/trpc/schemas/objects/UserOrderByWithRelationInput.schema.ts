import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z
  .object({
    id: SortOrderSchema.optional(),
    createdAt: SortOrderSchema.optional(),
    username: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
    password: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
    email: SortOrderSchema.optional(),
    googleId: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  })
  .strict();

export const UserOrderByWithRelationInputObjectSchema = Schema;
