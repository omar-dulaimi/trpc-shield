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
  return ({
    next,
    ctx,
    type,
    path,
    input,
    rawInput,
  }: {
    next: Function;
    ctx: TContext;
    type: string;
    path: string;
    input: { [name: string]: any };
    rawInput: unknown;
  }) => {
    const opWithPath: Array<string> = path.split('.');
    const opName: string = opWithPath[opWithPath.length - 1];
    const keys = Object.keys(ruleTree);
    let rule: ShieldRule<TContext> | undefined;
    if (keys.includes('query') || keys.includes('mutation')) {
      //@ts-ignore
      rule = ruleTree?.[type]?.[opName] || options.fallbackRule;
    } else {
      const namespace = opWithPath[0]
      rule = namespace?.[type]?.[opName] ?? options.fallbackRule;
    }

    if (rule) {
      return rule?.resolve(ctx, type, path, input, rawInput, options).then((result) => {
        if (result instanceof Error) throw result;
        if (!result) throw options.fallbackError;
        return next();
      });
    }
    return next();
  };
}
