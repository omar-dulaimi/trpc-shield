[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/omar-dulaimi/trpc-shield">
    <img src="media/shield.png" alt="Logo" width="150">
  </a>

  <h3 align="center">tRPC Shield</h3>

  <p align="center">
    tRPC permissions as another layer of abstraction!s!
    <br />
    <a href="https://github.com/omar-dulaimi/trpc-shield"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/omar-dulaimi/trpc-shield/issues">Report Bug</a>
    ·
    <a href="https://github.com/omar-dulaimi/trpc-shield/issues">Request Feature</a>
  </p>
</div>

<p align="center">
  <a href="https://www.buymeacoffee.com/omardulaimi">
    <img src="https://cdn.buymeacoffee.com/buttons/default-black.png" alt="Buy Me A Coffee" height="41" width="174">
  </a>
</p>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#overview">Overview</a>
    </li>
    <li>
      <a href="#supported-trpc-versions">Supported tRPC Versions</a>
    </li>
    <li>
      <a href="#installation">Installation</a>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#documentation">Documentation</a></li>
    <li><a href="#contributors">Contributors</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## Overview

tRPC Shield helps you create a permission layer for your application. Using an intuitive rule-API, you'll gain the power of the shield engine on every request. This way you can make sure no internal data will be exposed.

<!-- GETTING STARTED -->
## Supported tRPC Versions

### tRPC 11

- 0.5.0 and higher

### tRPC 10

- 0.2.0 to 0.4.x

### tRPC 9

- 0.1.2 and lower


## Installation

#### Using npm

```sh
npm install trpc-shield
```

#### Using yarn

```sh
yarn add trpc-shield
```

## Usage

- Don't forget to star this repo 😉

```ts
import * as trpc from '@trpc/server';
import { rule, shield, and, or, not } from 'trpc-shield';
import { Context } from '../../src/context';

// Rules

const isAuthenticated = rule<Context>()(async (ctx, type, path, input, rawInput) => {
  return ctx.user !== null
})

const isAdmin = rule<Context>()(async (ctx, type, path, input, rawInput) => {
  return ctx.user.role === 'admin'
})

const isEditor = rule<Context>()(async (ctx, type, path, input, rawInput) => {
  return ctx.user.role === 'editor'
})

// Permissions

const permissions = shield<Context>({
  query: {
    frontPage: not(isAuthenticated),
    fruits: and(isAuthenticated, or(isAdmin, isEditor)),
    customers: and(isAuthenticated, isAdmin),
  },
  mutation: {
    addFruitToBasket: isAuthenticated,
  },
});

export const t = trpc.initTRPC.context<Context>().create();

export const permissionsMiddleware = t.middleware(permissions);

export const shieldedProcedure = t.procedure.use(permissionsMiddleware);

```
For a fully working example, [go here](https://github.com/omar-dulaimi/trpc-shield/tree/master/example).
## Documentation

### Namespaced routers

```ts
export const permissions = shield<Context>({
  user: {
    query: {
      aggregateUser: allow,
      findFirstUser: allow,
      findManyUser: isAuthenticated,
      findUniqueUser: allow,
      groupByUser: allow,
    },
    mutation: {
      createOneUser: isAuthenticated,
      deleteManyUser: allow,
      deleteOneUser: allow,
      updateManyUser: allow,
      updateOneUser: allow,
      upsertOneUser: allow,
    },
  },
});
```

### API
#### `shield(rules?, options?)`

> Generates tRPC Middleware layer from your rules.

#### `rules`

All rules must be created using the `rule` function.

##### Limitations

- All rules must have a distinct name. Usually, you won't have to care about this as all names are by default automatically generated to prevent such problems. In case your function needs additional variables from other parts of the code and is defined as a function, you'll set a specific name to your rule to avoid name generation.

```jsx
// Normal
const admin = rule<Context>()(async (ctx, type, path, input, rawInput) => true)

// With external data
const admin = (bool) => rule<Context>(`name-${bool}`)(async (ctx, type, path, input, rawInput) => bool)
```

#### `options`

| Property            | Required | Default                  | Description                                        |
| ------------------- | -------- | ------------------------ | -------------------------------------------------- |
| allowExternalErrors | false    | false                    | Toggle catching internal errors.                   |
| debug               | false    | false                    | Toggle debug mode.                                 |
| fallbackRule        | false    | allow                    | The default rule for every "rule-undefined" field. |
| fallbackError       | false    | Error('Not Authorised!') | Error Permission system fallbacks to.              |

By default `shield` ensures no internal data is exposed to client if it was not meant to be. Therefore, all thrown errors during execution resolve in `Not Authorised!` error message if not otherwise specified using `error` wrapper. This can be turned off by setting `allowExternalErrors` option to true.

### Basic rules

> `allow`, `deny` are tRPC Shield predefined rules.

`allow` and `deny` rules do exactly what their names describe.

### Logic Rules

#### `and`, `or`, `not`, `chain`, `race`

> `and`, `or` and `not` allow you to nest rules in logic operations.

##### `and` rule

`and` rule allows access only if all sub rules used return `true`.

##### `chain` rule

`chain` rule allows you to chain the rules, meaning that rules won't be executed all at once, but one by one until one fails or all pass.

> The left-most rule is executed first.

##### `or` rule

`or` rule allows access if at least one sub rule returns `true` and no rule throws an error.

##### `race` rule

`race` rule allows you to chain the rules so that execution stops once one of them returns `true`.

##### not

`not` works as usual not in code works.

> You may also add a custom error message as the second parameter `not(rule, error)`.

```tsx
import { shield, rule, and, or } from 'trpc-shield'

const isAdmin = rule<Context>()(async (ctx, type, path, input, rawInput) => {
  return ctx.user.role === 'admin'
})

const isEditor = rule<Context>()(async (ctx, type, path, input, rawInput) => {
  return ctx.user.role === 'editor'
})

const isOwner = rule<Context>()(async (ctx, type, path, input, rawInput) => {
  return ctx.user.role === 'owner'
})

const permissions = shield<Context>({
  query: {
    users: or(isAdmin, isEditor),
  },
  mutation: {
    createBlogPost: or(isAdmin, and(isOwner, isEditor)),
  },
})
```

### Global Fallback Error

tRPC Shield allows you to set a globally defined fallback error that is used instead of `Not Authorised!` default response. This might be particularly useful for localization. You can use `string` or even custom `Error` to define it.

```ts
const permissions = shield<Context>(
  {
    query: {
      items: allow,
    },
  },
  {
    fallbackError: 'To je napaka!', // meaning "This is a mistake" in Slovene.
  },
)

const permissions = shield<Context>(
  {
    query: {
      items: allow,
    },
  },
  {
    fallbackError: new CustomError('You are something special!'),
  },
)
```

### Whitelisting vs Blacklisting

Shield allows you to lock-in access. This way, you can seamlessly develop and publish your work without worrying about exposing your data. To lock in your service simply set `fallbackRule` to `deny` like this;

```ts
const permissions = shield<Context>(
  {
    query: {
      users: allow,
    },
  },
  { fallbackRule: deny },
)
```

## Contributors

This project exists thanks to all the people who contribute.

## Contributing

We are always looking for people to help us grow `trpc-shield`! If you have an issue, feature request, or pull request, let us know!

## Acknowledgments

A huge thank you goes to everybody who worked on Graphql Shield, as this project is based on it.

Also thanks goes to flaticon, for use of one of their icons in the logo: <a href="https://www.flaticon.com/free-icons/shield" title="shield icons">Shield icons created by Freepik - Flaticon</a>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/omar-dulaimi/trpc-shield.svg?style=for-the-badge
[contributors-url]: https://github.com/omar-dulaimi/trpc-shield/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/omar-dulaimi/trpc-shield.svg?style=for-the-badge
[forks-url]: https://github.com/omar-dulaimi/trpc-shield/network/members
[stars-shield]: https://img.shields.io/github/stars/omar-dulaimi/trpc-shield.svg?style=for-the-badge
[stars-url]: https://github.com/omar-dulaimi/trpc-shield/stargazers
[issues-shield]: https://img.shields.io/github/issues/omar-dulaimi/trpc-shield.svg?style=for-the-badge
[issues-url]: https://github.com/omar-dulaimi/trpc-shield/issues
[license-shield]: https://img.shields.io/github/license/omar-dulaimi/trpc-shield?style=for-the-badge
[license-url]: https://github.com/omar-dulaimi/trpc-shield/blob/master/LICENSE
