import { describe, it, expect } from 'vitest';
import { shield, rule, allow, and } from '../src';

type Ctx = Record<string, any>;
const isAdmin = rule<Ctx>()(async (ctx) => ctx.user?.role === 'admin');

/**
 * A rule placed where the tree expects an operation type never resolves, so the procedure falls
 * through to the default `allow` and runs unguarded. Nothing warned about it, which for a
 * permissions library is the worst way to be wrong.
 */
describe('a malformed rule tree is refused rather than ignored', () => {
  it('rejects a rule sitting directly at the top level', () => {
    expect(() => shield<Ctx>({ myProcedure: isAdmin } as any)).toThrow(/myProcedure/);
  });

  it('explains where the rule should have gone', () => {
    expect(() => shield<Ctx>({ myProcedure: isAdmin } as any)).toThrow(/query.*mutation.*subscription/s);
  });

  it('rejects a composed rule at the top level too', () => {
    expect(() => shield<Ctx>({ myProcedure: and(isAdmin, allow) } as any)).toThrow(/myProcedure/);
  });

  it('rejects a namespace that skips the operation level', () => {
    expect(() => shield<Ctx>({ admin: { list: isAdmin } } as any)).toThrow(/admin/);
  });

  it('names every offending key, not just the first', () => {
    const error = (() => {
      try {
        shield<Ctx>({ one: isAdmin, two: isAdmin } as any);
      } catch (e) {
        return e as Error;
      }
    })();
    expect(error?.message).toMatch(/one/);
    expect(error?.message).toMatch(/two/);
  });
});

describe('valid shapes still build', () => {
  it('accepts the flat form', () => {
    expect(() => shield<Ctx>({ query: { thing: isAdmin } })).not.toThrow();
  });

  it('accepts the namespaced form', () => {
    expect(() => shield<Ctx>({ admin: { query: { list: isAdmin } } } as any)).not.toThrow();
  });

  it('accepts subscriptions alone', () => {
    expect(() => shield<Ctx>({ subscription: { onTick: isAdmin } } as any)).not.toThrow();
  });

  /**
   * Namespaces nest as deeply as the router does. An earlier version of the shape check only looked
   * one level down, so it rejected a tree matching `admin.user.findMany`, which resolves correctly.
   */
  it('accepts a deeply nested namespace', () => {
    expect(() => shield<Ctx>({ admin: { user: { query: { findMany: isAdmin } } } } as any)).not.toThrow();
  });

  it('still rejects a rule buried in a namespace with no operation type', () => {
    expect(() => shield<Ctx>({ admin: { user: isAdmin } } as any)).toThrow(/admin/);
  });

  it('accepts an empty tree', () => {
    expect(() => shield<Ctx>({})).not.toThrow();
  });
});
