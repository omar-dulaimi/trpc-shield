import { Rule, RuleAnd, RuleChain, RuleFalse, RuleNot, RuleOr, RuleRace, RuleTrue } from './rules';
import { IRuleConstructorOptions, IRuleFunction, ShieldRule } from './types';

/**
 *
 * @param name
 * @param options
 *
 * Wraps a function into a Rule class. This way we can identify rules
 * once we start generating middleware from our ruleTree.
 *
 * 1.
 * const auth = rule()(async (ctx, type, path, input, rawInput, options) => {
 *  return true
 * })
 *
 * 2.
 * const auth = rule('name')(async (ctx, type, path, input, rawInput, options) => {
 *  return true
 * })
 *
 * 3.
 * const auth = rule({
 *  name: 'name',
 * })(async (ctx, type, path, input, rawInput, options) => {
 *  return true
 * })
 *
 */
export const rule =
  <TContext extends Record<string, any>>(name?: string, options?: IRuleConstructorOptions) =>
  (func: IRuleFunction<TContext>): Rule<TContext> => {
    if (typeof name === 'object') {
      options = name;
      name = Math.random().toString();
    } else if (typeof name === 'string') {
      options = options || {};
    } else {
      name = Math.random().toString();
      options = {};
    }

    // @ts-ignore
    return new Rule(name, func, {});
  };

/**
 *
 * @param rules
 *
 * Logical operator and serves as a wrapper for and operation.
 *
 */
export const and = <TContext extends Record<string, any>>(...rules: ShieldRule<TContext>[]): RuleAnd<TContext> => {
  return new RuleAnd(rules);
};

/**
 *
 * @param rules
 *
 * Logical operator and serves as a wrapper for and operation.
 *
 */
export const chain = <TContext extends Record<string, any>>(...rules: ShieldRule<TContext>[]): RuleChain<TContext> => {
  return new RuleChain(rules);
};

/**
 *
 * @param rules
 *
 * Logical operator and serves as a wrapper for and operation.
 *
 */
export const race = <TContext extends Record<string, any>>(...rules: ShieldRule<TContext>[]): RuleRace<TContext> => {
  return new RuleRace(rules);
};

/**
 *
 * @param rules
 *
 * Logical operator or serves as a wrapper for or operation.
 *
 */
export const or = <TContext extends Record<string, any>>(...rules: ShieldRule<TContext>[]): RuleOr<TContext> => {
  return new RuleOr(rules);
};

/**
 *
 * @param rule
 *
 * Logical operator not serves as a wrapper for not operation.
 *
 */
export const not = <TContext extends Record<string, any>>(
  rule: ShieldRule<TContext>,
  error?: string | Error,
): RuleNot<TContext> => {
  if (typeof error === 'string') return new RuleNot(rule, new Error(error));
  return new RuleNot(rule, error);
};

/**
 *
 * Allow queries.
 *
 */
export const allow = new RuleTrue<Record<string, any>>();

/**
 *
 * Deny queries.
 *
 */
export const deny = new RuleFalse<Record<string, any>>();
