import { IOptions, IRules, ShieldRule } from './types.js';
import { isLogicRule, isRuleFunction } from './utils.js';

/**
 *
 * @param ruleTree
 * @param options
 *
 * Generates middleware from given rules.
 *
 */
export function generateMiddlewareFromRuleTree<TContext extends Record<string, unknown>>(
  ruleTree: IRules<TContext>,
  options: IOptions<TContext>,
) {
  return (opts: {
    next: Function;
    ctx: TContext;
    type: string;
    path: string;
    input: { [name: string]: any };
    getRawInput: () => unknown;
  }) => {
    const { next, ctx, type, path, input, getRawInput } = opts;
    const rawInput = getRawInput();
    const opWithPath: Array<string> = path.split('.');
    const opName: string = opWithPath[opWithPath.length - 1];
    let rule: ShieldRule<TContext> | undefined;

    // `IRules` is `ShieldRule | IRuleTypeMap`, so the whole tree may be a single rule meant to guard
    // every procedure. Enumerating its keys finds no operation type, so without this it resolved
    // nothing and fell through to the default `allow`.
    if (isRuleFunction(ruleTree) || isLogicRule(ruleTree)) {
      rule = ruleTree as ShieldRule<TContext>;
      return applyRule(rule);
    }

    const keys = Object.keys(ruleTree);
    // Every operation type must be listed. Omitting 'subscription' meant a tree holding only
    // subscription rules took the namespaced branch, matched nothing, and fell through to the
    // default `allow`, leaving the subscription unprotected.
    if (keys.includes('query') || keys.includes('mutation') || keys.includes('subscription')) {
      //@ts-ignore
      rule = ruleTree?.[type]?.[opName];
    } else {
      const namespace = opWithPath[0];

      let tree = (ruleTree as Record<string, any>)[namespace];
      for (let i = 1; i < opWithPath.length - 1; i++) {
        tree = tree?.[opWithPath[i]];
        if (!tree) break;
      }
      if (tree?.[type]?.[opName]) {
        rule = tree[type][opName];
      }
    }
    rule = rule || options.fallbackRule;
    return applyRule(rule);

    function applyRule(resolved: ShieldRule<TContext> | undefined) {
      if (!resolved) return next();

      return resolved.resolve(ctx, type, path, input, rawInput, options).then((result) => {
        if (result instanceof Error) throw result;

        // Handle context extension
        if (typeof result === 'object' && result !== null && 'ctx' in result) {
          const extendedCtx = { ...ctx, ...result.ctx };
          return next({ ctx: extendedCtx });
        }

        if (!result) throw options.fallbackError;
        return next();
      });
    }
  };
}
