import { initTRPC } from '@trpc/server';

// Mock context for testing
export interface TestContext {
  user?: {
    id: string;
    role: 'admin' | 'editor' | 'user';
    name?: string;
  } | null;
}

// Create tRPC instance for testing
export const t = initTRPC.context<TestContext>().create();

// Helper to create test context
export const createTestContext = (user?: TestContext['user']): TestContext => ({
  user: user || null,
});

// Helper to create middleware opts for testing
export const createMockMiddlewareOpts = (
  ctx: TestContext,
  type: 'query' | 'mutation' = 'query',
  path = 'test.procedure',
  input: any = {},
) => ({
  ctx,
  type,
  path,
  input,
  getRawInput: () => input,
  meta: undefined,
  signal: undefined,
  next: vi.fn().mockResolvedValue({ ok: true, data: 'success', marker: 'middlewareMarker' as any }),
});
