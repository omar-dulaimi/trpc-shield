import { describe, it, expect } from 'vitest';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { shield, rule, and, or, not, allow, deny } from '../src';
import type { TestContext } from './__helpers__/setup';

// Integration tests that test the full shield workflow with tRPC
describe('Integration Tests', () => {
  const t = initTRPC.context<TestContext>().create();

  // Define rules
  const isAuthenticated = rule<TestContext>()(async (ctx) => {
    return ctx.user !== null;
  });

  const isAdmin = rule<TestContext>()(async (ctx) => {
    return ctx.user?.role === 'admin';
  });

  const isEditor = rule<TestContext>()(async (ctx) => {
    return ctx.user?.role === 'editor';
  });

  const isOwner = rule<TestContext>()(async (ctx, type, path, input, rawInput) => {
    // In tRPC v11, rawInput might be a promise that we need to await
    const actualInput = rawInput instanceof Promise ? await rawInput : rawInput;
    return ctx.user?.id === (actualInput as any)?.userId;
  });

  describe('Basic shield integration', () => {
    it('should integrate with tRPC procedures', async () => {
      const permissions = shield<TestContext>({
        query: {
          hello: allow,
          protected: isAuthenticated,
          adminOnly: isAdmin,
        },
        mutation: {
          createPost: and(isAuthenticated, or(isAdmin, isEditor)),
          deleteUser: isAdmin,
        },
      });

      const protectedProcedure = t.procedure.use(permissions);
      const publicProcedure = t.procedure;

      const router = t.router({
        hello: publicProcedure.query(async () => 'Hello World'),
        protected: protectedProcedure.query(async () => 'Protected data'),
        adminOnly: protectedProcedure.query(async () => 'Admin data'),
        createPost: protectedProcedure.mutation(async () => 'Post created'),
        deleteUser: protectedProcedure.mutation(async () => 'User deleted'),
      });

      // Test public endpoint
      const publicCaller = router.createCaller({ user: null });
      const helloResult = await publicCaller.hello();
      expect(helloResult).toBe('Hello World');

      // Test authenticated endpoints
      const userCaller = router.createCaller({ user: { id: '1', role: 'user' } });
      const protectedResult = await userCaller.protected();
      expect(protectedResult).toBe('Protected data');

      // Test admin endpoints
      const adminCaller = router.createCaller({ user: { id: '2', role: 'admin' } });
      const adminResult = await adminCaller.adminOnly();
      expect(adminResult).toBe('Admin data');

      // Test unauthorized access
      await expect(userCaller.adminOnly()).rejects.toThrow('Not Authorised!');
      await expect(publicCaller.protected()).rejects.toThrow('Not Authorised!');
    });

    it('should work with complex rule combinations', async () => {
      const permissions = shield<TestContext>({
        mutation: {
          // Only authenticated users who are either admin or editor
          createPost: and(isAuthenticated, or(isAdmin, isEditor)),
          // Only non-authenticated users (public registration)
          register: not(isAuthenticated),
          // Admin or owner of the resource
          updateProfile: or(isAdmin, isOwner),
        },
      });

      const protectedProcedure = t.procedure.use(permissions);

      const router = t.router({
        createPost: protectedProcedure.mutation(async () => 'Post created'),
        register: protectedProcedure.mutation(async () => 'User registered'),
        updateProfile: protectedProcedure
          .input(z.object({ userId: z.string() }))
          .mutation(async ({ input }) => `Profile ${input.userId} updated`),
      });

      // Test editor can create post
      const editorCaller = router.createCaller({ user: { id: '1', role: 'editor' } });
      await expect(editorCaller.createPost()).resolves.toBe('Post created');

      // Test regular user cannot create post
      const userCaller = router.createCaller({ user: { id: '2', role: 'user' } });
      await expect(userCaller.createPost()).rejects.toThrow('Not Authorised!');

      // Test only unauthenticated can register
      const publicCaller = router.createCaller({ user: null });
      await expect(publicCaller.register()).resolves.toBe('User registered');
      await expect(editorCaller.register()).rejects.toThrow('Not Authorised!');

      // Test owner can update their profile
      const ownerCaller = router.createCaller({ user: { id: '3', role: 'user' } });
      await expect(ownerCaller.updateProfile({ userId: '3' })).resolves.toBe('Profile 3 updated');

      // Test user cannot update other's profile
      await expect(ownerCaller.updateProfile({ userId: '4' })).rejects.toThrow('Not Authorised!');

      // Test admin can update any profile
      const adminCaller = router.createCaller({ user: { id: '5', role: 'admin' } });
      await expect(adminCaller.updateProfile({ userId: '6' })).resolves.toBe('Profile 6 updated');
    });
  });

  describe('Namespaced routers', () => {
    it('should work with namespaced router structure', async () => {
      const permissions = shield<TestContext>({
        user: {
          query: {
            findMany: isAuthenticated,
            findUnique: allow,
            adminList: isAdmin,
          },
          mutation: {
            create: isAdmin,
            update: or(isAdmin, isOwner),
            delete: isAdmin,
          },
        },
        post: {
          query: {
            findMany: allow,
            findUnique: allow,
          },
          mutation: {
            create: and(isAuthenticated, or(isAdmin, isEditor)),
            update: or(isAdmin, isOwner),
            delete: isAdmin,
          },
        },
      });

      const protectedProcedure = t.procedure.use(permissions);

      const userRouter = t.router({
        findMany: protectedProcedure.query(async () => 'Users list'),
        findUnique: protectedProcedure.query(async () => 'User detail'),
        adminList: protectedProcedure.query(async () => 'Admin users'),
        create: protectedProcedure.mutation(async () => 'User created'),
        update: protectedProcedure
          .input(z.object({ userId: z.string() }))
          .mutation(async ({ input }) => `User ${input.userId} updated`),
        delete: protectedProcedure.mutation(async () => 'User deleted'),
      });

      const postRouter = t.router({
        findMany: protectedProcedure.query(async () => 'Posts list'),
        findUnique: protectedProcedure.query(async () => 'Post detail'),
        create: protectedProcedure.mutation(async () => 'Post created'),
        update: protectedProcedure
          .input(z.object({ userId: z.string() }))
          .mutation(async ({ input }) => `Post by ${input.userId} updated`),
        delete: protectedProcedure.mutation(async () => 'Post deleted'),
      });

      const router = t.router({
        user: userRouter,
        post: postRouter,
      });

      // Test different user roles
      const publicCaller = router.createCaller({ user: null });
      const userCaller = router.createCaller({ user: { id: '1', role: 'user' } });
      const editorCaller = router.createCaller({ user: { id: '2', role: 'editor' } });
      const adminCaller = router.createCaller({ user: { id: '3', role: 'admin' } });

      // Public access to allowed endpoints
      await expect(publicCaller.user.findUnique()).resolves.toBe('User detail');
      await expect(publicCaller.post.findMany()).resolves.toBe('Posts list');

      // Authenticated user access
      await expect(userCaller.user.findMany()).resolves.toBe('Users list');
      await expect(userCaller.user.adminList()).rejects.toThrow('Not Authorised!');

      // Editor can create posts but not users
      await expect(editorCaller.post.create()).resolves.toBe('Post created');
      await expect(editorCaller.user.create()).rejects.toThrow('Not Authorised!');

      // Admin has full access
      await expect(adminCaller.user.adminList()).resolves.toBe('Admin users');
      await expect(adminCaller.user.create()).resolves.toBe('User created');
      await expect(adminCaller.post.delete()).resolves.toBe('Post deleted');

      // Owner can update their own resources
      await expect(userCaller.user.update({ userId: '1' })).resolves.toBe('User 1 updated');
      await expect(userCaller.user.update({ userId: '2' })).rejects.toThrow('Not Authorised!');
    });
  });

  describe('Error handling', () => {
    it('should handle custom errors properly', async () => {
      const customErrorRule = rule<TestContext>()(async () => {
        return new Error('Custom permission error');
      });

      const stringErrorRule = rule<TestContext>()(async () => {
        return 'String error message';
      });

      const permissions = shield<TestContext>({
        query: {
          customError: customErrorRule,
          stringError: stringErrorRule,
        },
      });

      const protectedProcedure = t.procedure.use(permissions);
      const router = t.router({
        customError: protectedProcedure.query(async () => 'Success'),
        stringError: protectedProcedure.query(async () => 'Success'),
      });

      const caller = router.createCaller({ user: null });

      await expect(caller.customError()).rejects.toThrow('Custom permission error');
      await expect(caller.stringError()).rejects.toThrow('String error message');
    });

    it('should use fallback error when configured', async () => {
      const permissions = shield<TestContext>(
        {
          query: {
            test: deny,
          },
        },
        {
          fallbackError: 'Access denied by policy',
        },
      );

      const protectedProcedure = t.procedure.use(permissions);
      const router = t.router({
        test: protectedProcedure.query(async () => 'Success'),
      });

      const caller = router.createCaller({ user: null });
      await expect(caller.test()).rejects.toThrow('Access denied by policy');
    });
  });
});
