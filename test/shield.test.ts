import { describe, it, expect } from 'vitest';
import { shield } from '../src/shield';
import { allow, deny, rule } from '../src/constructors';
import { createTestContext, createMockMiddlewareOpts } from './__helpers__/setup';
import type { TestContext } from './__helpers__/setup';

describe('shield', () => {
  const isAuthenticated = rule<TestContext>()(async (ctx) => ctx.user !== null);
  const isAdmin = rule<TestContext>()(async (ctx) => ctx.user?.role === 'admin');

  describe('basic functionality', () => {
    it('should create middleware function', () => {
      const permissions = shield<TestContext>({
        query: {
          hello: allow,
        },
      });

      expect(typeof permissions).toBe('function');
    });

    it('should allow access when rule returns true', async () => {
      const permissions = shield<TestContext>({
        query: {
          hello: allow,
        },
      });

      const ctx = createTestContext();
      const opts = createMockMiddlewareOpts(ctx, 'query', 'hello');

      await permissions(opts);
      expect(opts.next).toHaveBeenCalled();
    });

    it('should deny access when rule returns false', async () => {
      const permissions = shield<TestContext>({
        query: {
          hello: deny,
        },
      });

      const ctx = createTestContext();
      const opts = createMockMiddlewareOpts(ctx, 'query', 'hello');

      await expect(permissions(opts)).rejects.toThrow('Not Authorised!');
    });

    it('should use fallback rule when no rule is defined', async () => {
      const permissions = shield<TestContext>(
        {
          query: {
            hello: allow,
          },
        },
        { fallbackRule: deny },
      );

      const ctx = createTestContext();
      const opts = createMockMiddlewareOpts(ctx, 'query', 'undefined');

      await expect(permissions(opts)).rejects.toThrow('Not Authorised!');
    });

    it('should use custom fallback error', async () => {
      const permissions = shield<TestContext>(
        {
          query: {
            hello: deny,
          },
        },
        { fallbackError: 'Custom error message' },
      );

      const ctx = createTestContext();
      const opts = createMockMiddlewareOpts(ctx, 'query', 'hello');

      await expect(permissions(opts)).rejects.toThrow('Custom error message');
    });
  });

  describe('authentication rules', () => {
    it('should allow authenticated users', async () => {
      const permissions = shield<TestContext>({
        query: {
          protected: isAuthenticated,
        },
      });

      const ctx = createTestContext({ id: '1', role: 'user' });
      const opts = createMockMiddlewareOpts(ctx, 'query', 'protected');

      await permissions(opts);
      expect(opts.next).toHaveBeenCalled();
    });

    it('should deny unauthenticated users', async () => {
      const permissions = shield<TestContext>({
        query: {
          protected: isAuthenticated,
        },
      });

      const ctx = createTestContext();
      const opts = createMockMiddlewareOpts(ctx, 'query', 'protected');

      await expect(permissions(opts)).rejects.toThrow('Not Authorised!');
    });

    it('should check admin role', async () => {
      const permissions = shield<TestContext>({
        query: {
          adminOnly: isAdmin,
        },
      });

      const adminCtx = createTestContext({ id: '1', role: 'admin' });
      const adminOpts = createMockMiddlewareOpts(adminCtx, 'query', 'adminOnly');

      await permissions(adminOpts);
      expect(adminOpts.next).toHaveBeenCalled();

      const userCtx = createTestContext({ id: '2', role: 'user' });
      const userOpts = createMockMiddlewareOpts(userCtx, 'query', 'adminOnly');

      await expect(permissions(userOpts)).rejects.toThrow('Not Authorised!');
    });
  });

  describe('namespaced routers', () => {
    it('should work with namespaced structure', async () => {
      const permissions = shield<TestContext>({
        user: {
          query: {
            findMany: isAuthenticated,
            findUnique: allow,
          },
          mutation: {
            create: isAdmin,
          },
        },
      });

      const ctx = createTestContext({ id: '1', role: 'user' });

      // Test namespaced query
      const queryOpts = createMockMiddlewareOpts(ctx, 'query', 'user.findMany');
      await permissions(queryOpts);
      expect(queryOpts.next).toHaveBeenCalled();

      // Test public namespaced query
      const publicOpts = createMockMiddlewareOpts(ctx, 'query', 'user.findUnique');
      await permissions(publicOpts);
      expect(publicOpts.next).toHaveBeenCalled();

      // Test admin-only mutation
      const mutationOpts = createMockMiddlewareOpts(ctx, 'mutation', 'user.create');
      await expect(permissions(mutationOpts)).rejects.toThrow('Not Authorised!');
    });
  });

  describe('error handling', () => {
    it('should handle rule that throws error', async () => {
      const throwingRule = rule<TestContext>()(async () => {
        throw new Error('Rule error');
      });

      const permissions = shield<TestContext>({
        query: {
          test: throwingRule,
        },
      });

      const ctx = createTestContext();
      const opts = createMockMiddlewareOpts(ctx, 'query', 'test');

      await expect(permissions(opts)).rejects.toThrow('Not Authorised!');
    });

    it('should mask rule that returns Error object by default', async () => {
      const errorRule = rule<TestContext>()(async () => {
        return new Error('Custom rule error');
      });

      const permissions = shield<TestContext>({
        query: {
          test: errorRule,
        },
      });

      const ctx = createTestContext();
      const opts = createMockMiddlewareOpts(ctx, 'query', 'test');

      await expect(permissions(opts)).rejects.toThrow('Not Authorised!');
    });

    it('should mask rule that returns string error by default', async () => {
      const stringErrorRule = rule<TestContext>()(async () => {
        return 'String error message';
      });

      const permissions = shield<TestContext>({
        query: {
          test: stringErrorRule,
        },
      });

      const ctx = createTestContext();
      const opts = createMockMiddlewareOpts(ctx, 'query', 'test');

      await expect(permissions(opts)).rejects.toThrow('Not Authorised!');
    });

    it('should allow custom rule errors when allowExternalErrors is true', async () => {
      const errorRule = rule<TestContext>()(async () => {
        return new Error('Custom rule error');
      });

      const stringErrorRule = rule<TestContext>()(async () => {
        return 'String error message';
      });

      const permissions = shield<TestContext>(
        {
          query: {
            err: errorRule,
            str: stringErrorRule,
          },
        },
        { allowExternalErrors: true },
      );

      const ctx = createTestContext();
      const errorOpts = createMockMiddlewareOpts(ctx, 'query', 'err');
      await expect(permissions(errorOpts)).rejects.toThrow('Custom rule error');

      const stringOpts = createMockMiddlewareOpts(ctx, 'query', 'str');
      await expect(permissions(stringOpts)).rejects.toThrow('String error message');
    });

    it('should respect debug mode for rule errors', async () => {
      const throwingRule = rule<TestContext>()(async () => {
        throw new Error('Debug error');
      });

      const permissions = shield<TestContext>(
        {
          query: {
            test: throwingRule,
          },
        },
        { debug: true },
      );

      const ctx = createTestContext();
      const opts = createMockMiddlewareOpts(ctx, 'query', 'test');

      await expect(permissions(opts)).rejects.toThrow('Debug error');
    });
  });

  describe('options', () => {
    it('should use allow as default fallback rule', async () => {
      const permissions = shield<TestContext>({
        query: {
          hello: allow,
        },
      });

      const ctx = createTestContext();
      const opts = createMockMiddlewareOpts(ctx, 'query', 'undefined');

      await permissions(opts);
      expect(opts.next).toHaveBeenCalled();
    });

    it('should normalize string fallback error to Error object', async () => {
      const permissions = shield<TestContext>(
        {
          query: {
            test: deny,
          },
        },
        { fallbackError: 'Custom string error' },
      );

      const ctx = createTestContext();
      const opts = createMockMiddlewareOpts(ctx, 'query', 'test');

      await expect(permissions(opts)).rejects.toThrow('Custom string error');
    });
  });
});
