import { describe, it, expect } from 'vitest';
import { shield } from '../src/shield';
import { rule } from '../src/constructors';
import { createTestContext, createMockMiddlewareOpts } from './__helpers__/setup';

describe('Context Extension', () => {
  it('should extend context when rule returns context object', async () => {
    // Rule that extends context with user information
    const isAuthenticated = rule<{ user?: { id: string; role: string } | null }>()(async (
      ctx,
      _type,
      _path,
      _input,
      _rawInput,
      _options,
    ) => {
      // Simulate authentication that adds user to context
      if (!ctx.user) {
        return { ctx: { user: { id: '1', role: 'user' } } };
      }
      return true;
    });

    const permissions = shield<{ user?: { id: string; role: string } | null }>({
      query: {
        findManyUser: isAuthenticated,
      },
    });

    const ctx = createTestContext(); // ctx.user is null initially
    const opts = createMockMiddlewareOpts(ctx, 'query', 'findManyUser');

    // Mock next to capture the context passed to it
    let nextCalledWith: any = null;
    opts.next = async (contextUpdate?: any) => {
      nextCalledWith = contextUpdate;
      return Promise.resolve();
    };

    await permissions(opts);

    // Verify the context was extended with user info
    expect(nextCalledWith?.ctx?.user).toEqual({ id: '1', role: 'user' });
  });

  it('should pass through context when rule returns true', async () => {
    const alwaysAllow = rule<{ user?: { id: string; role: string } | null }>()(async () => true);

    const permissions = shield<{ user?: { id: string; role: string } | null }>({
      query: {
        publicQuery: alwaysAllow,
      },
    });

    const ctx = createTestContext();
    const opts = createMockMiddlewareOpts(ctx, 'query', 'publicQuery');

    let nextCalledWith: any = null;
    opts.next = async (contextUpdate?: any) => {
      nextCalledWith = contextUpdate;
      return Promise.resolve();
    };

    await permissions(opts);

    // When rule returns true, next() should be called without context update
    expect(nextCalledWith).toBeUndefined();
  });

  it('should reproduce the original bug report scenario', async () => {
    // This test reproduces the exact scenario from the bug report
    type Context = {
      user?: string | null;
    };

    // isAuthenticated rule that extends context with user info (like from JWT token)
    const isAuthenticated = rule<Context>()(async (ctx) => {
      // Simulate token validation that would normally happen here
      if (!ctx.user) {
        // When authentication succeeds, extend context with user info
        return { ctx: { user: 'authenticated-user-id' } };
      }
      return true;
    });

    const permissions = shield<Context>({
      query: {
        findManyUser: isAuthenticated,
      },
    });

    // Initial context with no user (like an unauthenticated request)
    const initialCtx: Context = { user: null };
    const opts = createMockMiddlewareOpts(initialCtx, 'query', 'findManyUser');

    let extendedContext: any = null;
    opts.next = async (contextUpdate?: any) => {
      extendedContext = contextUpdate;
      return Promise.resolve();
    };

    await permissions(opts);

    // After shield middleware runs, the context should be extended with user info
    expect(extendedContext?.ctx?.user).toBe('authenticated-user-id');
  });

  it('should handle context extension with typed interfaces', async () => {
    interface AuthContext {
      user?: {
        id: string;
        role: 'admin' | 'user';
        email: string;
      } | null;
    }

    const authenticateWithRole = rule<AuthContext>()(async (ctx) => {
      if (!ctx.user) {
        // Simulate successful authentication with full user object
        return {
          ctx: {
            user: {
              id: 'user-123',
              role: 'admin' as const,
              email: 'admin@example.com',
            },
          },
        };
      }
      return true;
    });

    const permissions = shield<AuthContext>({
      query: {
        adminQuery: authenticateWithRole,
      },
    });

    const ctx: AuthContext = { user: null };
    const opts = createMockMiddlewareOpts(ctx, 'query', 'adminQuery');

    let result: any = null;
    opts.next = async (contextUpdate?: any) => {
      result = contextUpdate;
      return Promise.resolve();
    };

    await permissions(opts);

    expect(result?.ctx?.user).toEqual({
      id: 'user-123',
      role: 'admin',
      email: 'admin@example.com',
    });
  });

  it('should show how tRPC context extension should work', async () => {
    // This is how tRPC middleware context extension should work:
    const mockNext = async (contextUpdate?: { ctx?: any }) => {
      return Promise.resolve(contextUpdate);
    };

    // Proper tRPC middleware pattern
    const result = await mockNext({
      ctx: {
        user: { id: '1', role: 'user' },
      },
    });

    expect(result?.ctx?.user).toEqual({ id: '1', role: 'user' });
  });
});
