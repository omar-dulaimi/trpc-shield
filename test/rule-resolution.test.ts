import { describe, it, expect } from 'vitest';
import { shield, rule } from '../src';

type Ctx = Record<string, any>;
const deny = rule<Ctx>()(async () => false);

/**
 * Drives the generated middleware directly. Subscriptions are awkward to stand up through a real
 * tRPC router, and the behaviour under test is rule resolution, not transport.
 */
function callWith(tree: any, type: string, path: string): Promise<'allowed' | 'denied'> {
  const middleware: any = shield<Ctx>(tree);
  return middleware({
    next: () => 'allowed',
    ctx: {},
    type,
    path,
    input: {},
    getRawInput: () => ({}),
  }).then(
    (r: unknown) => (r === 'allowed' ? 'allowed' : 'denied'),
    () => 'denied',
  );
}

describe('rules resolve for every operation type', () => {
  it('applies a rule to a query', async () => {
    await expect(callWith({ query: { thing: deny } }, 'query', 'thing')).resolves.toBe('denied');
  });

  it('applies a rule to a mutation', async () => {
    await expect(callWith({ mutation: { thing: deny } }, 'mutation', 'thing')).resolves.toBe('denied');
  });

  /**
   * A tree holding only subscription rules used to resolve nothing and fall through to the default
   * `allow`, so the subscription was unprotected. Adding an unrelated `query` key made it start
   * working, which is what gave it away.
   */
  it('applies a rule to a subscription, with no query or mutation present', async () => {
    await expect(callWith({ subscription: { onTick: deny } }, 'subscription', 'onTick')).resolves.toBe('denied');
  });

  it('applies a subscription rule when a query key is also present', async () => {
    await expect(callWith({ query: { other: deny }, subscription: { onTick: deny } }, 'subscription', 'onTick')).resolves.toBe(
      'denied',
    );
  });

  it('still resolves namespaced trees, which have no operation key at the top', async () => {
    await expect(callWith({ admin: { query: { list: deny } } }, 'query', 'admin.list')).resolves.toBe('denied');
  });
});
