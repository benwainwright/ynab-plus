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
  logout: {
    component: "routes/logout.tsx",
    permissionsRequired: ["admin", "user"],
    authFailRedirect: "/",
  },
  register: {
    component: "routes/register.tsx",
    permissionsRequired: ["public"],
    authFailRedirect: "/login",
  },
} as const satisfies Record<string, RouteSpec>;
