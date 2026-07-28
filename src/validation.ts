import { ILogicRule, IRule, IRules, ShieldRule } from './types';
import { flattenObjectOf, isLogicRule, isRuleFunction } from './utils';

/**
 *
 * @param ruleTree
 *
 * Validates the rule tree declaration by checking references of rule
 * functions. We deem rule tree valid if no two rules with the same name point
 * to different rules.
 *
 */
const OPERATION_TYPES = ['query', 'mutation', 'subscription'];

/**
 * Checks that rules sit where the middleware looks for them.
 *
 * A rule resolves either as `tree[operation][name]` or as `tree[namespace][operation][name]`, so at
 * the top level a key is an operation type, or a namespace whose value holds one. A rule placed
 * anywhere else is never found, and the procedure falls through to the default `allow` and runs
 * unguarded. Nothing used to say so.
 */
/**
 * Whether a branch leads to an operation type, and so to a rule the middleware can find.
 *
 * Namespaces nest to any depth, matching a router tree like `admin.user.findMany`, so this recurses
 * rather than looking one level down. A rule is not a namespace: reaching one means the tree put a
 * rule where a router name belongs.
 */
function leadsToAnOperation(branch: unknown): boolean {
  if (isRuleFunction(branch) || isLogicRule(branch)) return false;
  if (branch === null || typeof branch !== 'object') return false;

  const keys = Object.keys(branch as object);
  if (keys.some((key) => OPERATION_TYPES.includes(key))) return true;
  return keys.some((key) => leadsToAnOperation((branch as Record<string, unknown>)[key]));
}

function findMisplacedRules<TContext extends Record<string, any>>(ruleTree: IRules<TContext>): string[] {
  // A bare rule as the whole tree applies to everything; there are no keys to misplace.
  if (isRuleFunction(ruleTree) || isLogicRule(ruleTree)) return [];

  return Object.entries(ruleTree as Record<string, unknown>)
    .filter(([key]) => !OPERATION_TYPES.includes(key))
    .filter(([, branch]) => !leadsToAnOperation(branch))
    .map(([key]) => key);
}

export function validateRuleTree<TContext extends Record<string, any>>(
  ruleTree: IRules<TContext>,
): { status: 'ok' } | { status: 'err'; message: string } {
  const misplaced = findMisplacedRules(ruleTree);
  if (misplaced.length > 0) {
    return {
      status: 'err',
      message:
        `These rule tree keys are in a position where no rule can be found, so the procedures they ` +
        `were meant to guard would run unprotected: ${misplaced.join(', ')}. ` +
        `Rules belong under an operation type, as in { query: { myProcedure: myRule } }, or under a ` +
        `router namespace that contains one, as in { myRouter: { mutation: { myProcedure: myRule } } }. ` +
        `Valid operation types are query, mutation and subscription.`,
    };
  }

  const rules = extractRules(ruleTree);

  const valid = rules.reduce<{ map: Map<string, IRule<TContext>>; duplicates: string[] }>(
    ({ map, duplicates }, rule) => {
      if (!map.has(rule.name)) {
        return { map: map.set(rule.name, rule), duplicates };
      } else if (!map.get(rule.name)!.equals(rule) && !duplicates.includes(rule.name)) {
        return {
          map: map.set(rule.name, rule),
          duplicates: [...duplicates, rule.name],
        };
      } else {
        return { map, duplicates };
      }
    },
    { map: new Map<string, IRule<TContext>>(), duplicates: [] },
  );

  if (valid.duplicates.length === 0) {
    return { status: 'ok' };
  } else {
    const duplicates = valid.duplicates.join(', ');
    return {
      status: 'err',
      message: `There seem to be multiple definitions of these rules: ${duplicates}`,
    };
  }

  /* Helper functions */
  /**
   *
   * @param ruleTree
   *
   * Extracts rules from rule tree.
   *
   */
  function extractRules<TContext extends Record<string, any>>(ruleTree: IRules<TContext>): IRule<TContext>[] {
    const resolvers = flattenObjectOf<ShieldRule<TContext>>(ruleTree, isRuleFunction);

    const rules = resolvers.reduce<IRule<TContext>[]>((rules, rule) => {
      if (isLogicRule(rule)) {
        return [...rules, ...extractLogicRules(rule)];
      } else {
        return [...rules, rule as any];
      }
    }, []);

    return rules;
  }

  /**
   *
   * Recursively extracts Rules from LogicRule
   *
   * @param rule
   */
  function extractLogicRules<TContext extends Record<string, any>>(rule: ILogicRule<TContext>): IRule<TContext>[] {
    return rule.getRules().reduce<IRule<TContext>[]>((acc, shieldRule) => {
      if (isLogicRule(shieldRule)) {
        return [...acc, ...extractLogicRules(shieldRule)];
      } else {
        return [...acc, shieldRule as any];
      }
    }, []);
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
