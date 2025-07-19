import { describe, it, expect } from 'vitest';
import { rule, and, or, not, chain, race, allow, deny } from '../src/constructors';
import { Rule, RuleAnd, RuleOr, RuleNot, RuleChain, RuleRace, RuleTrue, RuleFalse } from '../src/rules';
import type { TestContext } from './__helpers__/setup';

describe('constructors', () => {
  describe('rule constructor', () => {
    it('should create rule with random name when no name provided', () => {
      const testRule = rule<TestContext>()(async () => true);

      expect(testRule).toBeInstanceOf(Rule);
      expect(testRule.name).toBeDefined();
      expect(typeof testRule.name).toBe('string');
    });

    it('should create rule with provided name', () => {
      const testRule = rule<TestContext>('testRule')(async () => true);

      expect(testRule).toBeInstanceOf(Rule);
      expect(testRule.name).toBe('testRule');
    });

    it('should create rule with object options', () => {
      const options = { someOption: true };
      const testRule = rule<TestContext>(options as any)(async () => true);

      expect(testRule).toBeInstanceOf(Rule);
      expect(testRule.name).toBeDefined();
    });

    it('should create rule with name and options', () => {
      const options = { someOption: true };
      const testRule = rule<TestContext>('namedRule', options as any)(async () => true);

      expect(testRule).toBeInstanceOf(Rule);
      expect(testRule.name).toBe('namedRule');
    });

    it('should generate different names for different rules', () => {
      const rule1 = rule<TestContext>()(async () => true);
      const rule2 = rule<TestContext>()(async () => false);

      expect(rule1.name).not.toBe(rule2.name);
    });
  });

  describe('and constructor', () => {
    it('should create RuleAnd instance', () => {
      const rule1 = rule<TestContext>()(async () => true);
      const rule2 = rule<TestContext>()(async () => true);
      const andRule = and(rule1, rule2);

      expect(andRule).toBeInstanceOf(RuleAnd);
    });

    it('should accept multiple rules', () => {
      const rule1 = rule<TestContext>()(async () => true);
      const rule2 = rule<TestContext>()(async () => true);
      const rule3 = rule<TestContext>()(async () => true);
      const andRule = and(rule1, rule2, rule3);

      expect(andRule.getRules()).toHaveLength(3);
      expect(andRule.getRules()).toContain(rule1);
      expect(andRule.getRules()).toContain(rule2);
      expect(andRule.getRules()).toContain(rule3);
    });

    it('should work with built-in rules', () => {
      const andRule = and(allow, deny);

      expect(andRule).toBeInstanceOf(RuleAnd);
      expect(andRule.getRules()).toHaveLength(2);
    });
  });

  describe('or constructor', () => {
    it('should create RuleOr instance', () => {
      const rule1 = rule<TestContext>()(async () => true);
      const rule2 = rule<TestContext>()(async () => false);
      const orRule = or(rule1, rule2);

      expect(orRule).toBeInstanceOf(RuleOr);
    });

    it('should accept multiple rules', () => {
      const rule1 = rule<TestContext>()(async () => true);
      const rule2 = rule<TestContext>()(async () => false);
      const rule3 = rule<TestContext>()(async () => true);
      const orRule = or(rule1, rule2, rule3);

      expect(orRule.getRules()).toHaveLength(3);
    });
  });

  describe('not constructor', () => {
    it('should create RuleNot instance', () => {
      const testRule = rule<TestContext>()(async () => true);
      const notRule = not(testRule);

      expect(notRule).toBeInstanceOf(RuleNot);
      expect(notRule.getRules()).toHaveLength(1);
      expect(notRule.getRules()[0]).toBe(testRule);
    });

    it('should create RuleNot with string error', () => {
      const testRule = rule<TestContext>()(async () => true);
      const notRule = not(testRule, 'Custom error');

      expect(notRule).toBeInstanceOf(RuleNot);
      expect(notRule.error).toBeInstanceOf(Error);
      expect(notRule.error?.message).toBe('Custom error');
    });

    it('should create RuleNot with Error object', () => {
      const customError = new Error('Custom error object');
      const testRule = rule<TestContext>()(async () => true);
      const notRule = not(testRule, customError);

      expect(notRule).toBeInstanceOf(RuleNot);
      expect(notRule.error).toBe(customError);
    });

    it('should work without custom error', () => {
      const testRule = rule<TestContext>()(async () => true);
      const notRule = not(testRule);

      expect(notRule).toBeInstanceOf(RuleNot);
      expect(notRule.error).toBeUndefined();
    });
  });

  describe('chain constructor', () => {
    it('should create RuleChain instance', () => {
      const rule1 = rule<TestContext>()(async () => true);
      const rule2 = rule<TestContext>()(async () => true);
      const chainRule = chain(rule1, rule2);

      expect(chainRule).toBeInstanceOf(RuleChain);
    });

    it('should preserve rule order', () => {
      const rule1 = rule<TestContext>()(async () => true);
      const rule2 = rule<TestContext>()(async () => false);
      const rule3 = rule<TestContext>()(async () => true);
      const chainRule = chain(rule1, rule2, rule3);

      const rules = chainRule.getRules();
      expect(rules[0]).toBe(rule1);
      expect(rules[1]).toBe(rule2);
      expect(rules[2]).toBe(rule3);
    });
  });

  describe('race constructor', () => {
    it('should create RuleRace instance', () => {
      const rule1 = rule<TestContext>()(async () => false);
      const rule2 = rule<TestContext>()(async () => true);
      const raceRule = race(rule1, rule2);

      expect(raceRule).toBeInstanceOf(RuleRace);
    });

    it('should accept multiple rules', () => {
      const rule1 = rule<TestContext>()(async () => false);
      const rule2 = rule<TestContext>()(async () => false);
      const rule3 = rule<TestContext>()(async () => true);
      const raceRule = race(rule1, rule2, rule3);

      expect(raceRule.getRules()).toHaveLength(3);
    });
  });

  describe('built-in rules', () => {
    it('should export allow rule as RuleTrue', () => {
      expect(allow).toBeInstanceOf(RuleTrue);
    });

    it('should export deny rule as RuleFalse', () => {
      expect(deny).toBeInstanceOf(RuleFalse);
    });
  });

  describe('nested rules', () => {
    it('should allow nesting logic rules', () => {
      const rule1 = rule<TestContext>()(async () => true);
      const rule2 = rule<TestContext>()(async () => false);
      const rule3 = rule<TestContext>()(async () => true);

      const nested = and(rule1, or(rule2, rule3), not(deny));

      expect(nested).toBeInstanceOf(RuleAnd);
      expect(nested.getRules()).toHaveLength(3);
      expect(nested.getRules()[1]).toBeInstanceOf(RuleOr);
      expect(nested.getRules()[2]).toBeInstanceOf(RuleNot);
    });

    it('should support complex nesting scenarios', () => {
      const isAuth = rule<TestContext>()(async (ctx) => ctx.user !== null);
      const isAdmin = rule<TestContext>()(async (ctx) => ctx.user?.role === 'admin');
      const isEditor = rule<TestContext>()(async (ctx) => ctx.user?.role === 'editor');

      const complexRule = and(isAuth, or(isAdmin, and(isEditor, not(deny))), chain(allow, allow));

      expect(complexRule).toBeInstanceOf(RuleAnd);
      const rules = complexRule.getRules();
      expect(rules).toHaveLength(3);
      expect(rules[0]).toBe(isAuth);
      expect(rules[1]).toBeInstanceOf(RuleOr);
      expect(rules[2]).toBeInstanceOf(RuleChain);
    });
  });
});
