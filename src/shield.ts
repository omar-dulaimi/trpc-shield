import { ValidationError, validateRuleTree } from './validation'
import { IRules, IOptions, IOptionsConstructor, ShieldRule, IFallbackErrorType } from './types'
import { generateMiddlewareFromRuleTree } from './generator'
import { allow } from './constructors'
import { withDefault } from './utils'
import { MiddlewareFunction } from '@trpc/server'

/**
 *
 * @param options
 *
 * Makes sure all of defined rules are in accord with the options
 * shield can process.
 *
 */
function normalizeOptions(options: IOptionsConstructor): IOptions {
  if (typeof options.fallbackError === 'string') {
    options.fallbackError = new Error(options.fallbackError)
  }

  return {
    debug: options.debug !== undefined ? options.debug : false,
    allowExternalErrors: withDefault(false)(options.allowExternalErrors),
    fallbackRule: withDefault<ShieldRule>(allow)(options.fallbackRule),
    fallbackError: withDefault<IFallbackErrorType>(new Error('Not Authorised!'))(options.fallbackError),
  }
}

/**
 *
 * @param ruleTree
 * @param options
 *
 * Validates rules and generates middleware from defined rule tree.
 *
 */
export function shield(ruleTree: IRules, options: IOptionsConstructor = {}): MiddlewareFunction<any, any> {
  const normalizedOptions = normalizeOptions(options)
  const ruleTreeValidity = validateRuleTree(ruleTree)

  if (ruleTreeValidity.status === 'ok') {
    const middleware = generateMiddlewareFromRuleTree(ruleTree, normalizedOptions)
    return middleware
  } else {
    throw new ValidationError(ruleTreeValidity.message)
  }
}
