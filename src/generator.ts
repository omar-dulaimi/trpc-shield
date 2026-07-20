import { IOptions, IRules, ShieldRule } from './types';

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
    const keys = Object.keys(ruleTree);
    let rule: ShieldRule<TContext> | undefined;
    if (keys.includes('query') || keys.includes('mutation')) {
      //@ts-ignore
      rule = ruleTree?.[type]?.[opName];
    } else {
      const namespace = opWithPath[0];

      let tree = (ruleTree as Record<string, any>)[namespace];
      if (opWithPath.length > 2) {
        for (let i = 1; i < opWithPath.length - 1; i++) {
          const currentNamespace = opWithPath[i];
          tree = (tree as Record<string, any>)[currentNamespace];

          if (tree?.[type]?.[opName]) {
            rule = tree[type][opName];
            break;
          }
        }
      } else {
        if (tree?.[type]?.[opName]) {
          rule = tree[type][opName];
        }
      }
    }
    rule = rule || options.fallbackRule;

    if (rule) {
      return rule?.resolve(ctx, type, path, input, rawInput, options).then((result) => {
        if (result instanceof Error) throw result;

        // Handle context extension
        if (typeof result === 'object' && result !== null && 'ctx' in result) {
          // Merge context extension and call next with updated context
          const extendedCtx = { ...ctx, ...result.ctx };
          return next({ ctx: extendedCtx });
        }

        if (!result) throw options.fallbackError;
        return next();
      });
    }
    return next();
  };
}
