# tRPC Shield

[![NPM Version](https://img.shields.io/npm/v/trpc-shield?style=for-the-badge&logo=npm&color=blue)](https://www.npmjs.com/package/trpc-shield)
[![NPM Downloads](https://img.shields.io/npm/dm/trpc-shield?style=for-the-badge&logo=npm&color=green)](https://www.npmjs.com/package/trpc-shield)
[![GitHub Stars](https://img.shields.io/github/stars/omar-dulaimi/trpc-shield?style=for-the-badge&logo=github&color=yellow)](https://github.com/omar-dulaimi/trpc-shield/stargazers)
[![License](https://img.shields.io/github/license/omar-dulaimi/trpc-shield?style=for-the-badge&color=purple)](https://github.com/omar-dulaimi/trpc-shield/blob/master/LICENSE)
[![Test Coverage](https://img.shields.io/badge/coverage-comprehensive-brightgreen?style=for-the-badge)](https://github.com/omar-dulaimi/trpc-shield)

<div align="center">
  <img src="media/shield.png" alt="tRPC Shield Logo" width="200">
  
  <h3 align="center">🛡️ tRPC Shield</h3>
  <p align="center">
    <strong>Powerful permission layer for tRPC applications</strong><br>
    Create secure, type-safe APIs with intuitive rule-based authorization
  </p>
  
  <p align="center">
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-documentation">Documentation</a> •
    <a href="#-examples">Examples</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>

## 💖 Support This Project

If this tool helps you build better applications, please consider supporting its development:

<p align="center">
  <a href="https://github.com/sponsors/omar-dulaimi">
    <img src="https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?style=for-the-badge&logo=github" alt="GitHub Sponsors" height="40">
  </a>
</p>

Your sponsorship helps maintain and improve this project. Thank you! 🙏

## 🆕 Latest Version

**Get the latest stable version with full tRPC v11 support!**

```bash
npm install trpc-shield
```

This version includes **tRPC v11.x compatibility and context extension support** - bringing full compatibility with the latest tRPC features. For specific version requirements, see the [compatibility table](#-version-compatibility) below.

## ✨ Features

- 🔒 **Rule-based permissions** - Define authorization logic with intuitive, composable rules
- 🚀 **tRPC v11 support** - Full compatibility with the latest tRPC features
- 🔄 **Context extension** - Rules can extend context with authentication data
- 🧩 **Logic operators** - Combine rules with `and`, `or`, `not`, `chain`, and `race`
- 🛡️ **Secure by default** - Prevents data leaks with fallback rules
- 📝 **TypeScript first** - Full type safety and IntelliSense support
- 🎯 **Zero dependencies** - Lightweight and fast
- 🧪 **Well tested** - Comprehensive test coverage

## 🚀 Quick Start

### Installation

```bash
# npm
npm install trpc-shield

# yarn
yarn add trpc-shield

# pnpm
pnpm add trpc-shield
```

### Basic Example

```typescript
import { initTRPC } from '@trpc/server';
import { rule, shield, and, or, not } from 'trpc-shield';

type Context = {
  user?: { id: string; role: string; name: string };
  token?: string;
};

// Create rules
const isAuthenticated = rule<Context>()(async (ctx) => {
  return ctx.user !== null;
});

const isAdmin = rule<Context>()(async (ctx) => {
  return ctx.user?.role === 'admin';
});

// Create permissions
const permissions = shield<Context>({
  query: {
    publicData: true, // Always allow
    profile: isAuthenticated,
    adminData: and(isAuthenticated, isAdmin),
  },
  mutation: {
    updateProfile: isAuthenticated,
    deleteUser: and(isAuthenticated, isAdmin),
  },
});

// Apply to tRPC
const t = initTRPC.context<Context>().create();
const middleware = t.middleware(permissions);
const protectedProcedure = t.procedure.use(middleware);
```

## 📋 Version Compatibility

| tRPC Version | Shield Version | Status |
|--------------|----------------|---------|
| **v11.x** | **v1.0.0+** | ✅ **Recommended** |
| v10.x | v0.2.0 - v0.4.x | ⚠️ Legacy |
| v9.x | v0.1.2 and below | ❌ Deprecated |

### 🆕 What's New in Latest Version

- **tRPC v11 Support** - Full compatibility with latest tRPC features
- **Context Extension** - Rules can now extend context (see [Context Extension](#-context-extension))
- **Improved TypeScript** - Better type inference and safety
- **Performance Optimizations** - Faster rule evaluation
- **Enhanced Testing** - Comprehensive test coverage

## 🔧 Core Concepts

### Rules

Rules are the building blocks of your permission system. Each rule is an async function that returns:
- `true` - Allow access
- `false` - Deny access
- `Error` - Deny with custom error
- `{ ctx: {...} }` - Allow and extend context

```typescript
const isOwner = rule<Context>()(async (ctx, type, path, input) => {
  const resourceId = input.id;
  const resource = await getResource(resourceId);
  
  if (resource.ownerId !== ctx.user?.id) {
    return new Error('You can only access your own resources');
  }
  
  return true;
});
```

### Logic Operators

Combine rules with powerful logic operators:

```typescript
const permissions = shield<Context>({
  query: {
    // All rules must pass
    sensitiveData: and(isAuthenticated, isAdmin, isEmailVerified),
    
    // At least one rule must pass
    moderatedContent: or(isAdmin, isModerator),
    
    // Rule must fail
    publicEndpoint: not(isInternalRequest),
    
    // Execute rules in sequence until one passes
    content: race(isOwner, isCollaborator, isPublicAccess),
    
    // Execute rules in sequence, all must pass
    secureAction: chain(isAuthenticated, isEmailVerified, hasPermission),
  },
});
```

## 🔄 Context Extension

> **New in v1.0.0** - Rules can extend the tRPC context

Rules can return an object with a `ctx` property to extend the context for subsequent middleware and procedures:

```typescript
const withAuth = rule<Context>()(async (ctx) => {
  // If user is already in context, just validate
  if (ctx.user) {
    return true;
  }
  
  // If we have a token, validate and extend context
  if (ctx.token) {
    try {
      const user = await validateToken(ctx.token);
      // Extend context with user data
      return { ctx: { user } };
    } catch {
      return new Error('Invalid token');
    }
  }
  
  return false;
});

// Usage
const authenticatedProcedure = t.procedure
  .use(shield({ query: { profile: withAuth } }))
  .query(({ ctx }) => {
    // ctx.user is now available and properly typed!
    return { message: `Hello ${ctx.user.name}!` };
  });
```

## 📚 Advanced Usage

### Namespaced Routers

Organize permissions for complex router structures:

```typescript
const permissions = shield<Context>({
  // Nested router permissions
  user: {
    query: {
      profile: isAuthenticated,
      list: and(isAuthenticated, isAdmin),
    },
    mutation: {
      update: isOwner,
      delete: and(isAuthenticated, or(isOwner, isAdmin)),
    },
  },
  
  // Another namespace
  posts: {
    query: {
      public: true,
      drafts: isOwner,
    },
    mutation: {
      create: isAuthenticated,
      publish: and(isOwner, hasPublishPermission),
    },
  },
});
```

### Configuration Options

Customize shield behavior:

```typescript
const permissions = shield<Context>(
  {
    query: {
      data: isAuthenticated,
    },
  },
  {
    // Allow external errors to be thrown (default: false)
    allowExternalErrors: true,
    
    // Enable debug mode for development
    debug: process.env.NODE_ENV === 'development',
    
    // Default rule for undefined paths (default: allow)
    fallbackRule: deny,
    
    // Custom error message or Error instance
    fallbackError: 'Access denied',
    // or
    fallbackError: new CustomError('Insufficient permissions'),
  }
);
```

### Error Handling

```typescript
const permissions = shield<Context>({
  mutation: {
    deletePost: rule<Context>()(async (ctx, type, path, input) => {
      const post = await getPost(input.id);
      
      if (!post) {
        return new Error('Post not found');
      }
      
      if (post.authorId !== ctx.user?.id && ctx.user?.role !== 'admin') {
        return new Error('You can only delete your own posts');
      }
      
      return true;
    }),
  },
});
```

## 🎯 Examples

### Complete Authentication Flow

```typescript
import { initTRPC, TRPCError } from '@trpc/server';
import { shield, rule, and, or, not } from 'trpc-shield';
import jwt from 'jsonwebtoken';

type User = {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  emailVerified: boolean;
};

type Context = {
  user?: User;
  token?: string;
};

// Authentication rule with context extension
const authenticate = rule<Context>()(async (ctx) => {
  if (ctx.user) return true;
  
  if (!ctx.token) {
    return new Error('Authentication required');
  }
  
  try {
    const payload = jwt.verify(ctx.token, process.env.JWT_SECRET!) as any;
    const user = await getUserById(payload.userId);
    
    if (!user) {
      return new Error('User not found');
    }
    
    // Extend context with user
    return { ctx: { user } };
  } catch {
    return new Error('Invalid token');
  }
});

// Authorization rules
const isAdmin = rule<Context>()(async (ctx) => ctx.user?.role === 'admin');
const isModerator = rule<Context>()(async (ctx) => ctx.user?.role === 'moderator');
const isEmailVerified = rule<Context>()(async (ctx) => ctx.user?.emailVerified === true);

// Permission definitions
const permissions = shield<Context>({
  query: {
    // Public endpoints
    publicPosts: true,
    healthCheck: true,
    
    // Authenticated endpoints
    profile: authenticate,
    notifications: and(authenticate, isEmailVerified),
    
    // Admin endpoints
    userList: and(authenticate, isAdmin),
    analytics: and(authenticate, or(isAdmin, isModerator)),
  },
  
  mutation: {
    // Public mutations
    register: not(authenticate), // Only unauthenticated users
    login: not(authenticate),
    
    // Authenticated mutations
    updateProfile: and(authenticate, isEmailVerified),
    createPost: authenticate,
    
    // Admin mutations
    deleteUser: and(authenticate, isAdmin),
    banUser: and(authenticate, or(isAdmin, isModerator)),
  },
});

// tRPC setup
const t = initTRPC.context<Context>().create();

export const middleware = t.middleware(permissions);
export const protectedProcedure = t.procedure.use(middleware);

// Usage in router
export const appRouter = t.router({
  profile: protectedProcedure
    .query(({ ctx }) => {
      // ctx.user is guaranteed to exist and be typed correctly
      return {
        id: ctx.user.id,
        email: ctx.user.email,
        role: ctx.user.role,
      };
    }),
    
  updateProfile: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // User is authenticated and email verified
      return await updateUser(ctx.user.id, { name: input.name });
    }),
});
```

### Resource-Based Permissions

```typescript
const isResourceOwner = (resourceType: string) => 
  rule<Context>(`isOwnerOf${resourceType}`)(async (ctx, type, path, input) => {
    const resource = await getResource(resourceType, input.id);
    return resource.ownerId === ctx.user?.id;
  });

const permissions = shield<Context>({
  mutation: {
    updatePost: and(authenticate, isResourceOwner('post')),
    deleteComment: and(authenticate, or(
      isResourceOwner('comment'),
      isResourceOwner('post'), // Post owner can delete comments
      isAdmin
    )),
  },
});
```

## 🧪 Testing

tRPC Shield is extensively tested with comprehensive coverage. Test your rules in isolation:

```typescript
import { describe, it, expect } from 'vitest';

describe('Authentication Rules', () => {
  it('should allow authenticated users', async () => {
    const ctx = { user: { id: '1', role: 'user' } };
    const result = await isAuthenticated.resolve(ctx, 'query', 'profile', {}, {}, {});
    expect(result).toBe(true);
  });
  
  it('should extend context with user data', async () => {
    const ctx = { token: 'valid-jwt-token' };
    const result = await authenticate.resolve(ctx, 'query', 'profile', {}, {}, {});
    expect(result).toEqual({ ctx: { user: expect.any(Object) } });
  });
});
```

## 🔒 Security Best Practices

1. **Use `deny` as fallback** for sensitive applications:
   ```typescript
   shield(permissions, { fallbackRule: deny })
   ```

2. **Validate input in rules**:
   ```typescript
   const isOwner = rule<Context>()(async (ctx, type, path, input) => {
     if (!input?.id) return new Error('Resource ID required');
     // ... rest of logic
   });
   ```

3. **Don't expose sensitive errors** in production:
   ```typescript
   shield(permissions, { 
     allowExternalErrors: process.env.NODE_ENV === 'development' 
   })
   ```

4. **Use specific error messages** for better UX:
   ```typescript
   const hasPermission = rule<Context>()(async (ctx) => {
     if (!ctx.user) return new Error('Please log in to continue');
     if (!ctx.user.emailVerified) return new Error('Please verify your email');
     return true;
   });
   ```

## 📖 API Reference

### `shield(permissions, options?)`

Creates a tRPC middleware from your permission rules.

**Parameters:**
- `permissions` - Object defining rules for queries and mutations
- `options` - Configuration object

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `allowExternalErrors` | `boolean` | `false` | Allow custom errors to bubble up |
| `debug` | `boolean` | `false` | Enable debug logging |
| `fallbackRule` | `Rule` | `allow` | Default rule for undefined paths |
| `fallbackError` | `string \| Error` | `"Not Authorised!"` | Default error message |

### `rule(name?)(fn)`

Creates a permission rule.

**Parameters:**
- `name` - Optional rule name for debugging
- `fn` - Rule function `(ctx, type, path, input, rawInput, options) => boolean | Error | {ctx: object}`

### Logic Operators

- `and(...rules)` - All rules must pass
- `or(...rules)` - At least one rule must pass  
- `not(rule, error?)` - Rule must fail
- `chain(...rules)` - Execute rules sequentially, all must pass
- `race(...rules)` - Execute rules sequentially until one passes

### Built-in Rules

- `allow` - Always allows access
- `deny` - Always denies access

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/omar-dulaimi/trpc-shield.git
cd trpc-shield
npm install
npm run build
npm test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [GraphQL Shield](https://github.com/maticzav/graphql-shield)
- Built for the amazing [tRPC](https://trpc.io) ecosystem
- Shield icon by [Freepik](https://www.flaticon.com/free-icons/shield) from Flaticon

---

<div align="center">
  <p>Made with ❤️ by the tRPC Shield team</p>
  <p>
    <a href="https://github.com/omar-dulaimi/trpc-shield/stargazers">⭐ Star us on GitHub</a> •
    <a href="https://github.com/omar-dulaimi/trpc-shield/issues">🐛 Report Issues</a> •
    <a href="https://github.com/omar-dulaimi/trpc-shield/discussions">💬 Discussions</a>
  </p>
</div>

<!-- Force GitHub README refresh -->