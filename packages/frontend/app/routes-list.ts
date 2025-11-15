import type { Permission } from "@ynab-plus/domain";

export interface RouteSpec {
  isIndex?: boolean;
  path?: string;
  hideFromMenu?: boolean;
  component: string;
  permissionsRequired: Permission[];
  authFailRedirect: string;
}

export const routesList = {
  home: {
    component: "routes/home.tsx",
    isIndex: true,
    permissionsRequired: ["admin", "user"],
    authFailRedirect: "/login",
  },
  login: {
    component: "routes/login.tsx",
    permissionsRequired: ["public"],
    authFailRedirect: "/",
  },
  register: {
    component: "routes/register.tsx",
    permissionsRequired: ["public"],
    authFailRedirect: "/",
  },
  integrations: {
    component: "routes/integrations.tsx",
    permissionsRequired: ["admin", "user"],
    authFailRedirect: "/login",
  },
  accounts: {
    component: "routes/accounts.tsx",
    permissionsRequired: ["admin", "user"],
    authFailRedirect: "/",
  },
  users: {
    component: "routes/users.tsx",
    permissionsRequired: ["admin"],
    authFailRedirect: "/",
  },
  editUser: {
    component: "routes/edit-user.tsx",
    permissionsRequired: ["admin"],
    path: "users/:userId/edit",
    authFailRedirect: "/",
    hideFromMenu: true,
  },
  logout: {
    component: "routes/logout.tsx",
    permissionsRequired: ["admin", "user"],
    authFailRedirect: "/",
  },
} as const satisfies Record<string, RouteSpec>;
