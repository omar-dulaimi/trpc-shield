import { allow, and, rule, shield } from 'trpc-shield';
import type { Context } from './context';

const isAuthenticated = rule<Context>()(async ({ user }) => Boolean(user));
const isAdmin = rule<Context>()(async ({ user }) => user?.role === 'admin');

export const permissions = shield({
  query: {
    user: {
      list: allow,
      byId: isAuthenticated,
    },
  },
  mutation: {
    user: {
      create: and(isAuthenticated, isAdmin),
    },
  },
});
