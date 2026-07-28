# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **trpc-shield**, a TypeScript library that provides a permission layer for tRPC applications. It's inspired by GraphQL Shield and allows developers to define authorization rules as middleware for tRPC procedures.

**Version 0.5.0+** supports tRPC v11.x, while earlier versions support tRPC v10.x.

## Build and Development Commands

- `pnpm build` - Compile TypeScript twice: CommonJS to `lib/`, ES modules to `lib/esm/`
- `pnpm prebuild` - Clean `lib/` and the `.tsbuildinfo` files before building
- `pnpm release` - Build and publish the package (runs `./package.sh` then publishes from `package/` dir)
- `pnpm prettier` - Format code using Prettier

### Module format

The package is dual-published and the `exports` map in `package.json` is the source of truth: `require()` gets the CommonJS build in `lib/`, `import` gets the ES modules in `lib/esm/`, which `scripts/build-esm-marker.mjs` marks with a nested `{"type":"module"}` package.json. `main`, `module` and `types` are kept accurate alongside it, because `moduleResolution: node10` consumers ignore the map entirely.

Two rules follow from this:

- **Relative imports in `src/` must carry an explicit `.js` extension.** TypeScript emits specifiers verbatim and Node's ESM resolver does not guess extensions, so an extensionless import compiles cleanly and then fails to load for every ESM consumer.
- **The root `package.json` must not declare `"type": "module"`.** It would make Node read the CommonJS build in `lib/` as ESM. That is what made 2.0.0 and 2.0.1 impossible to load at all.

Do not add `incremental` to the build tsconfigs unless the `.tsbuildinfo` file lands inside a directory `prebuild` cleans. TypeScript 5.9 writes it next to `tsconfig.json` rather than into `outDir`, and it does not check whether the outputs still exist, so a stale one makes `tsc` skip emit and exit 0 with no `lib/` at all. Every 1.x release shipped that way, with no build output in the tarball.

## Testing

- `pnpm test` - Run all tests with Vitest
- `pnpm test:package` - Pack the tarball, install it into an empty directory, then `require()` it, `import` it and type-check against it
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm test:ui` - Run tests with Vitest UI

The Vitest suites import from `../src`, so they pass no matter what the build emits or the tarball contains. Every packaging defect this project has shipped lived in that gap. `pnpm test:package` is the only check that loads what a consumer installs; run it after touching `package.json`, either tsconfig, or anything under `scripts/`.

The project has comprehensive test coverage (>94%) including:
- Unit tests for all rule types and logic operations
- Integration tests with tRPC procedures
- Edge case and error handling tests
- TypeScript type validation tests

## Code Quality

- `pnpm lint` - Run ESLint for code linting
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm typecheck` - Run TypeScript type checking

The project uses:
- **ESLint 9** with TypeScript support
- **Prettier** for code formatting
- **lint-staged** for pre-commit hooks
- Relaxed type safety for library flexibility while maintaining code quality

## Architecture

### Core Components

- **`src/shield.ts`** - Main shield function that creates tRPC middleware from rule trees
- **`src/constructors.ts`** - Rule constructors (`rule`, `and`, `or`, `not`, `chain`, `race`, `allow`, `deny`)
- **`src/rules.ts`** - Rule class implementations (Rule, LogicRule, RuleAnd, RuleOr, etc.)
- **`src/generator.ts`** - Middleware generator that processes rule trees and creates tRPC middleware
- **`src/types.ts`** - TypeScript type definitions for all shield components
- **`src/validation.ts`** - Rule tree validation logic
- **`src/utils.ts`** - Utility functions

### Key Concepts

1. **Rules**: Basic permission units created with `rule()` function that return boolean/Error/string
2. **Logic Rules**: Composite rules (`and`, `or`, `not`, `chain`, `race`) that combine other rules
3. **Shield**: Main function that generates tRPC middleware from a rule tree
4. **Rule Tree**: Nested object structure defining permissions for query/mutation operations

### tRPC v11 Compatibility Notes

In tRPC v11, the `rawInput` parameter in rules may be a Promise that needs to be awaited:

```typescript
const isOwner = rule<Context>()(async (ctx, type, path, input, rawInput) => {
  const actualInput = rawInput instanceof Promise ? await rawInput : rawInput
  return ctx.user?.id === actualInput?.userId
})
```

This is due to tRPC v11's lazy input materialization feature.

### Rule Resolution

Rules are resolved in the middleware by:
1. Extracting operation type (`query`/`mutation`) and name from the tRPC path
2. Finding the matching rule in the tree (supports namespaced routers)
3. Falling back to `fallbackRule` (default: `allow`) if no rule found
4. Executing the rule and handling results (true = allow, false/Error = deny)

### Example Structure

The library supports both flat and namespaced router structures:

```typescript
// Flat structure
shield({
  query: { users: isAuthenticated },
  mutation: { createUser: and(isAuthenticated, isAdmin) }
})

// Namespaced structure  
shield({
  user: {
    query: { findMany: isAuthenticated },
    mutation: { create: isAdmin }
  }
})
```

## Development Notes

- The project uses TypeScript with strict mode enabled
- Example implementation available in `example/` directory with Prisma integration
- Built files are excluded from Git (in `lib/`)
- The tarball is defined by the `files` field, which ships `lib/` and nothing else. There is no `.npmignore`, and without `files` npm shipped `src/`, `test/` and `example/` too
- Releases are published by semantic-release from the repository root, not by `package.sh`
