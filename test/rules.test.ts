import { describe, it, expect, vi } from 'vitest';
import { Rule } from '../src/rules';
import { rule, and, or, not, chain, race, allow, deny } from '../src/constructors';
import { createTestContext } from './__helpers__/setup';
import type { TestContext } from './__helpers__/setup';
import type { IOptions } from '../src/types';

describe('Rule', () => {
  const defaultOptions: IOptions<TestContext> = {
    debug: false,
    allowExternalErrors: false,
    fallbackRule: allow,
    fallbackError: new Error('Not Authorised!'),
  };

  describe('basic rule functionality', () => {
    it('should resolve to true when rule function returns true', async () => {
      const testRule = rule<TestContext>()(async () => true);
      const ctx = createTestContext();

      const result = await testRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBe(true);
    });

    it('should resolve to false when rule function returns false', async () => {
      const testRule = rule<TestContext>()(async () => false);
      const ctx = createTestContext();

      const result = await testRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBe(false);
    });

    it('should resolve to Error when rule function returns Error', async () => {
      const error = new Error('Test error');
      const testRule = rule<TestContext>()(async () => error);
      const ctx = createTestContext();

      const result = await testRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBe(error);
    });

    it('should convert string return to Error', async () => {
      const testRule = rule<TestContext>()(async () => 'String error');
      const ctx = createTestContext();

      const result = await testRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('String error');
    });

    it('should handle thrown errors in debug mode', async () => {
      const testRule = rule<TestContext>()(async () => {
        throw new Error('Thrown error');
      });
      const ctx = createTestContext();
      const debugOptions = { ...defaultOptions, debug: true };

      await expect(testRule.resolve(ctx, 'query', 'test', {}, {}, debugOptions)).rejects.toThrow('Thrown error');
    });

    it('should return false for thrown errors in production mode', async () => {
      const testRule = rule<TestContext>()(async () => {
        throw new Error('Thrown error');
      });
      const ctx = createTestContext();

      const result = await testRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBe(false);
    });

    it('should pass correct parameters to rule function', async () => {
      const mockRule = vi.fn().mockResolvedValue(true);
      const testRule = rule<TestContext>()(mockRule);
      const ctx = createTestContext({ id: '1', role: 'user' });
      const input = { test: 'data' };
      const rawInput = { raw: 'input' };

      await testRule.resolve(ctx, 'query', 'test.path', input, rawInput, defaultOptions);

      expect(mockRule).toHaveBeenCalledWith(ctx, 'query', 'test.path', input, rawInput, defaultOptions);
    });
  });

  describe('rule equality', () => {
    it('should identify equal rules', () => {
      const func = async () => true;
      const rule1 = new Rule('test', func, {});
      const rule2 = new Rule('test2', func, {});

      expect(rule1.equals(rule2)).toBe(true);
    });

    it('should identify different rules', () => {
      const rule1 = new Rule('test1', async () => true, {});
      const rule2 = new Rule('test2', async () => false, {});

      expect(rule1.equals(rule2)).toBe(false);
    });
  });
});

describe('Logic Rules', () => {
  const defaultOptions: IOptions<TestContext> = {
    debug: false,
    allowExternalErrors: false,
    fallbackRule: allow,
    fallbackError: new Error('Not Authorised!'),
  };

  describe('RuleAnd', () => {
    it('should return true when all rules return true', async () => {
      const rule1 = rule<TestContext>()(async () => true);
      const rule2 = rule<TestContext>()(async () => true);
      const andRule = and(rule1, rule2);
      const ctx = createTestContext();

      const result = await andRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBe(true);
    });

    it('should return false when any rule returns false', async () => {
      const rule1 = rule<TestContext>()(async () => true);
      const rule2 = rule<TestContext>()(async () => false);
      const andRule = and(rule1, rule2);
      const ctx = createTestContext();

      const result = await andRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBe(false);
    });

    it('should return first error when a rule returns error', async () => {
      const error = new Error('Test error');
      const rule1 = rule<TestContext>()(async () => true);
      const rule2 = rule<TestContext>()(async () => error);
      const andRule = and(rule1, rule2);
      const ctx = createTestContext();

      const result = await andRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBe(error);
    });
  });

  describe('RuleOr', () => {
    it('should return true when any rule returns true', async () => {
      const rule1 = rule<TestContext>()(async () => false);
      const rule2 = rule<TestContext>()(async () => true);
      const orRule = or(rule1, rule2);
      const ctx = createTestContext();

      const result = await orRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBe(true);
    });

    it('should return false when all rules return false', async () => {
      const rule1 = rule<TestContext>()(async () => false);
      const rule2 = rule<TestContext>()(async () => false);
      const orRule = or(rule1, rule2);
      const ctx = createTestContext();

      const result = await orRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBe(false);
    });

    it('should return custom error when present and all rules fail', async () => {
      const customError = new Error('Custom error');
      const rule1 = rule<TestContext>()(async () => false);
      const rule2 = rule<TestContext>()(async () => customError);
      const orRule = or(rule1, rule2);
      const ctx = createTestContext();

      const result = await orRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBe(customError);
    });
  });

  describe('RuleNot', () => {
    it('should invert true to false', async () => {
      const rule1 = rule<TestContext>()(async () => true);
      const notRule = not(rule1);
      const ctx = createTestContext();

      const result = await notRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBe(false);
    });

    it('should invert false to true', async () => {
      const rule1 = rule<TestContext>()(async () => false);
      const notRule = not(rule1);
      const ctx = createTestContext();

      const result = await notRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBe(true);
    });

    it('should invert error to true', async () => {
      const rule1 = rule<TestContext>()(async () => new Error('Test error'));
      const notRule = not(rule1);
      const ctx = createTestContext();

      const result = await notRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBe(true);
    });

    it('should use custom error when provided', async () => {
      const customError = new Error('Custom not error');
      const rule1 = rule<TestContext>()(async () => true);
      const notRule = not(rule1, customError);
      const ctx = createTestContext();

      const result = await notRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBe(customError);
    });

    it('should handle string error parameter', async () => {
      const rule1 = rule<TestContext>()(async () => true);
      const notRule = not(rule1, 'String error');
      const ctx = createTestContext();

      const result = await notRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('String error');
    });
  });

  describe('RuleChain', () => {
    it('should execute rules sequentially and stop on first failure', async () => {
      const rule1 = vi.fn().mockResolvedValue(true);
      const rule2 = vi.fn().mockResolvedValue(false);
      const rule3 = vi.fn().mockResolvedValue(true);

      const chainRule = chain(rule<TestContext>()(rule1), rule<TestContext>()(rule2), rule<TestContext>()(rule3));
      const ctx = createTestContext();

      const result = await chainRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);

      expect(rule1).toHaveBeenCalled();
      expect(rule2).toHaveBeenCalled();
      expect(rule3).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return true when all rules pass', async () => {
      const rule1 = rule<TestContext>()(async () => true);
      const rule2 = rule<TestContext>()(async () => true);
      const chainRule = chain(rule1, rule2);
      const ctx = createTestContext();

      const result = await chainRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBe(true);
    });
  });

  describe('RuleRace', () => {
    it('should stop on first successful rule', async () => {
      const rule1 = vi.fn().mockResolvedValue(false);
      const rule2 = vi.fn().mockResolvedValue(true);
      const rule3 = vi.fn().mockResolvedValue(true);

      const raceRule = race(rule<TestContext>()(rule1), rule<TestContext>()(rule2), rule<TestContext>()(rule3));
      const ctx = createTestContext();

      const result = await raceRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);

      expect(rule1).toHaveBeenCalled();
      expect(rule2).toHaveBeenCalled();
      expect(rule3).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when all rules fail', async () => {
      const rule1 = rule<TestContext>()(async () => false);
      const rule2 = rule<TestContext>()(async () => false);
      const raceRule = race(rule1, rule2);
      const ctx = createTestContext();

      const result = await raceRule.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBe(false);
    });
  });

  describe('Built-in rules', () => {
    it('should test allow rule', async () => {
      const ctx = createTestContext();
      const result = await allow.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBe(true);
    });

    it('should test deny rule', async () => {
      const ctx = createTestContext();
      const result = await deny.resolve(ctx, 'query', 'test', {}, {}, defaultOptions);
      expect(result).toBe(false);
    });
  });
});
