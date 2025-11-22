# Express Server with tRPC Shield Example

This example shows how to **implement an Express server with tRPC, tRPC Shield and Prisma**.

## Getting started

### 1. Download example and install dependencies

Download this example:

```bash
npx create-trpc-appx --example https://github.com/omar-dulaimi/trpc-shield/tree/master/example
```

Install pnpm dependencies:

```
cd express-trpc-shield
pnpm install
```

### 2. Create and seed the database using Prisma

Run the following command to create your SQLite database file:

```bash
pnpm prisma migrate dev --name init
```

### 3. Start the server

Launch your server with this command:

```
pnpm dev
```

Now your server is ready to use at: [http://localhost:3001](http://localhost:3001)

### 4. Simulate authenticated requests

This example reads the following headers to populate `ctx.user`:

- `x-user-id`: numeric identifier for the user (any positive integer).
- `x-user-role`: `admin` or `user` (defaults to `user` if omitted).

All routes are mounted under `/trpc`. For example, you can fetch a user by ID with:

```bash
curl -X POST http://localhost:3001/trpc/user.byId \
  -H 'content-type: application/json' \
  -H 'x-user-id: 1' \
  -d '{"input":{"id":1}}'
```
