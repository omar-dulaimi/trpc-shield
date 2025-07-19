// Rule

export type ShieldRule<TContext> = IRule<TContext> | ILogicRule<TContext>;

export declare class IRule<TContext> {
  readonly name: string;

  constructor(options: IRuleOptions);

  equals(rule: IRule<TContext>): boolean;
  resolve(
    ctx: TContext,
    type: string,
    path: string,
    input: { [name: string]: any },
    rawInput: unknown,
    options: IOptions<TContext>,
  ): Promise<IRuleResult>;
}

export interface IRuleOptions {}

export declare class ILogicRule<TContext> {
  constructor(rules: ShieldRule<TContext>[]);

  getRules(): ShieldRule<TContext>[];
  evaluate(
    ctx: TContext,
    type: string,
    path: string,
    input: { [name: string]: any },
    rawInput: unknown,
    options: IOptions<TContext>,
  ): Promise<IRuleResult[]>;
  resolve(
    ctx: TContext,
    type: string,
    path: string,
    input: { [name: string]: any },
    rawInput: unknown,
    options: IOptions<TContext>,
  ): Promise<IRuleResult>;
}

export type IRuleResult = boolean | string | Error;
export type IRuleFunction<TContext extends Record<string, any> = Record<string, any>> = (
  ctx: TContext,
  type: string,
  path: string,
  input: { [name: string]: any },
  rawInput: unknown,
  options: IOptions<TContext>,
) => IRuleResult | Promise<IRuleResult>;

export interface IRuleConstructorOptions {}

// Rules Definition Tree

export interface IRuleTypeMap<TContext> {
  [key: string]: ShieldRule<TContext> | IRuleFieldMap<TContext> | IRuleTypeMap<TContext>;
}

export interface IRuleFieldMap<TContext> {
  [key: string]: ShieldRule<TContext>;
}

export type IRules<TContext> = ShieldRule<TContext> | IRuleTypeMap<TContext>;

export type IFallbackErrorMapperType<TContext> = (
  err: unknown,
  ctx: TContext,
  type: string,
  path: string,
  input: { [name: string]: any },
  rawInput: unknown,
) => Promise<Error> | Error;

export type IFallbackErrorType<TContext> = Error | IFallbackErrorMapperType<TContext>;

// Generator Options

export interface IOptions<TContext> {
  debug: boolean;
  allowExternalErrors: boolean;
  fallbackRule: ShieldRule<TContext>;
  fallbackError?: IFallbackErrorType<TContext>;
}

export interface IOptionsConstructor<TContext> {
  debug?: boolean;
  allowExternalErrors?: boolean;
  fallbackRule?: ShieldRule<TContext>;
  fallbackError?: string | IFallbackErrorType<TContext>;
}

export declare function shield<TContext>(ruleTree: IRules<TContext>, options: IOptions<TContext>): any;
