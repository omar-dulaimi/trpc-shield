import { t, shieldedProcedure } from "./helpers/createRouter";
import { UserAggregateSchema } from "../schemas/aggregateUser.schema";
import { UserCreateManySchema } from "../schemas/createManyUser.schema";
import { UserCreateOneSchema } from "../schemas/createOneUser.schema";
import { UserDeleteManySchema } from "../schemas/deleteManyUser.schema";
import { UserDeleteOneSchema } from "../schemas/deleteOneUser.schema";
import { UserFindFirstSchema } from "../schemas/findFirstUser.schema";
import { UserFindManySchema } from "../schemas/findManyUser.schema";
import { UserFindUniqueSchema } from "../schemas/findUniqueUser.schema";
import { UserGroupBySchema } from "../schemas/groupByUser.schema";
import { UserUpdateManySchema } from "../schemas/updateManyUser.schema";
import { UserUpdateOneSchema } from "../schemas/updateOneUser.schema";
import { UserUpsertSchema } from "../schemas/upsertOneUser.schema";

export const usersRouter = t.router({
  aggregateUser: shieldedProcedure
    .input(UserAggregateSchema).query(async ({ ctx, input }) => {
      const aggregateUser = await ctx.prisma.user.aggregate(input);
      return aggregateUser;
    }),
  createManyUser: shieldedProcedure
    .input(UserCreateManySchema).mutation(async ({ ctx, input }) => {
      const createManyUser = await ctx.prisma.user.createMany(input);
      return createManyUser;
    }),
  createOneUser: shieldedProcedure
    .input(UserCreateOneSchema).mutation(async ({ ctx, input }) => {
      const createOneUser = await ctx.prisma.user.create(input);
      return createOneUser;
    }),
  deleteManyUser: shieldedProcedure
    .input(UserDeleteManySchema).mutation(async ({ ctx, input }) => {
      const deleteManyUser = await ctx.prisma.user.deleteMany(input);
      return deleteManyUser;
    }),
  deleteOneUser: shieldedProcedure
    .input(UserDeleteOneSchema).mutation(async ({ ctx, input }) => {
      const deleteOneUser = await ctx.prisma.user.delete(input);
      return deleteOneUser;
    }),
  findFirstUser: shieldedProcedure
    .input(UserFindFirstSchema).query(async ({ ctx, input }) => {
      const findFirstUser = await ctx.prisma.user.findFirst(input);
      return findFirstUser;
    }),
  findFirstUserOrThrow: shieldedProcedure
    .input(UserFindFirstSchema).query(async ({ ctx, input }) => {
      const findFirstUserOrThrow = await ctx.prisma.user.findFirstOrThrow(input);
      return findFirstUserOrThrow;
    }),
  findManyUser: shieldedProcedure
    .input(UserFindManySchema).query(async ({ ctx, input }) => {
      const findManyUser = await ctx.prisma.user.findMany(input);
      return findManyUser;
    }),
  findUniqueUser: shieldedProcedure
    .input(UserFindUniqueSchema).query(async ({ ctx, input }) => {
      const findUniqueUser = await ctx.prisma.user.findUnique(input);
      return findUniqueUser;
    }),
  findUniqueUserOrThrow: shieldedProcedure
    .input(UserFindUniqueSchema).query(async ({ ctx, input }) => {
      const findUniqueUserOrThrow = await ctx.prisma.user.findUniqueOrThrow(input);
      return findUniqueUserOrThrow;
    }),
  groupByUser: shieldedProcedure
    .input(UserGroupBySchema).query(async ({ ctx, input }) => {
      const groupByUser = await ctx.prisma.user.groupBy({ where: input.where, orderBy: input.orderBy, by: input.by, having: input.having, take: input.take, skip: input.skip });
      return groupByUser;
    }),
  updateManyUser: shieldedProcedure
    .input(UserUpdateManySchema).mutation(async ({ ctx, input }) => {
      const updateManyUser = await ctx.prisma.user.updateMany(input);
      return updateManyUser;
    }),
  updateOneUser: shieldedProcedure
    .input(UserUpdateOneSchema).mutation(async ({ ctx, input }) => {
      const updateOneUser = await ctx.prisma.user.update(input);
      return updateOneUser;
    }),
  upsertOneUser: shieldedProcedure
    .input(UserUpsertSchema).mutation(async ({ ctx, input }) => {
      const upsertOneUser = await ctx.prisma.user.upsert(input);
      return upsertOneUser;
    }),

}) 
