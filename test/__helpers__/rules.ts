import { rule } from '../../src/constructors';
import type { TestContext } from './setup';

// Common test rules
export const isAuthenticated = rule<TestContext>()(async (ctx) => {
  return ctx.user !== null;
});

export const isAdmin = rule<TestContext>()(async (ctx) => {
  return ctx.user?.role === 'admin';
});

export const isEditor = rule<TestContext>()(async (ctx) => {
  return ctx.user?.role === 'editor';
});

export const isOwner = rule<TestContext>()(async (ctx, type, path, input) => {
  return ctx.user?.id === input.userId;
});

export const alwaysTrue = rule<TestContext>()(async () => {
  return true;
});

export const alwaysFalse = rule<TestContext>()(async () => {
  return false;
});

export const throwsError = rule<TestContext>()(async () => {
  throw new Error('Custom rule error');
});

export const returnsError = rule<TestContext>()(async () => {
  return new Error('Rule returned error');
});

export const returnsString = rule<TestContext>()(async () => {
  return 'String error message';
});
