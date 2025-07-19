# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **trpc-shield**, a TypeScript library that provides a permission layer for tRPC applications. It's inspired by GraphQL Shield and allows developers to define authorization rules as middleware for tRPC procedures.

## Build and Development Commands

- `npm run build` - Compile TypeScript to JavaScript (outputs to `dist/`)
- `npm run prebuild` - Clean the dist folder before building
- `npm run release` - Build and publish the package (runs `./package.sh` then publishes from `package/` dir)
- `npm run prettier` - Format code using Prettier

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
- No tests are currently defined in package.json
- Example implementation available in `example/` directory with Prisma integration
- Built files are excluded from Git (in `dist/`)
- Package publication uses a custom script that operates from a `package/` subdirectory