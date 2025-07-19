import { describe, it, expect } from 'vitest';
import { validateRuleTree, ValidationError } from '../src/validation';
import { rule, allow, deny, and, or } from '../src/constructors';
import type { TestContext } from './__helpers__/setup';

describe('validation', () => {
  const testRule = rule<TestContext>()(async () => true);

  describe('validateRuleTree', () => {
    it('should validate correct rule tree structure', () => {
      const ruleTree = {
        query: {
          hello: allow,
          protected: testRule,
        },
        mutation: {
          create: and(testRule, allow),
          delete: or(testRule, deny),
        },
      };

      const result = validateRuleTree(ruleTree);
      expect(result.status).toBe('ok');
    });

    it('should validate namespaced rule tree structure', () => {
      const ruleTree = {
        user: {
          query: {
            findMany: testRule,
            findUnique: allow,
          },
          mutation: {
            create: testRule,
            update: allow,
          },
        },
        post: {
          query: {
            findMany: allow,
          },
        },
      };

      const result = validateRuleTree(ruleTree);
      expect(result.status).toBe('ok');
    });

    it('should validate single rule as rule tree', () => {
      const result = validateRuleTree(allow);
      expect(result.status).toBe('ok');
    });

    it('should handle empty rule tree', () => {
      const result = validateRuleTree({});
      expect(result.status).toBe('ok');
    });

    it('should validate complex nested logic rules', () => {
      const ruleTree = {
        query: {
          complex: and(testRule, or(allow, and(testRule, deny))),
        },
      };

      const result = validateRuleTree(ruleTree);
      expect(result.status).toBe('ok');
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with message', () => {
      const error = new ValidationError('Test validation error');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Test validation error');
    });

    it('should be throwable', () => {
      expect(() => {
        throw new ValidationError('Test error');
      }).toThrow('Test error');
    });
  });
});
