import type { Permission } from "@ynab-plus/domain";

export interface RouteSpec {
  isIndex?: boolean;
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
  logout: {
    component: "routes/logout.tsx",
    permissionsRequired: ["admin", "user"],
    authFailRedirect: "/",
  },
} as const satisfies Record<string, RouteSpec>;
