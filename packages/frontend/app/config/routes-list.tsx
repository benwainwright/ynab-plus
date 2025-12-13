import type { Permission } from "@ynab-plus/domain";
import { type ReactElement } from "react";
import {
  IconLogout,
  IconLogin,
  IconCurrencyPound,
  IconUser,
  IconHome,
  IconPlug,
  IconUsers,
  IconEngine,
} from "@tabler/icons-react";

export interface RouteSpec {
  isIndex?: boolean;
  path?: string;
  header?: string;
  hideFromMenu?: boolean;
  component: string;
  permissionsRequired: Permission[];
  authFailRedirect: string;
  sidebarIcon?: ReactElement;
}

export const routesList: Record<string, RouteSpec> = {
  home: {
    component: "routes/home.tsx",
    isIndex: true,
    permissionsRequired: ["admin", "user"],
    authFailRedirect: "/login",
    sidebarIcon: <IconHome size={16} stroke={1.5} />,
  },
  login: {
    component: "routes/login.tsx",
    permissionsRequired: ["public"],
    authFailRedirect: "/",
    sidebarIcon: <IconLogin size={16} stroke={1.5} />,
  },
  register: {
    component: "routes/register.tsx",
    permissionsRequired: ["public"],
    authFailRedirect: "/",
    sidebarIcon: <IconUser size={16} stroke={1.5} />,
  },
  integrations: {
    component: "routes/integrations.tsx",
    permissionsRequired: ["admin", "user"],
    authFailRedirect: "/login",
    sidebarIcon: <IconPlug size={16} stroke={1.5} />,
  },
  accounts: {
    component: "routes/accounts.tsx",
    permissionsRequired: ["admin", "user"],
    authFailRedirect: "/",
    sidebarIcon: <IconCurrencyPound size={16} stroke={1.5} />,
  },
  transactions: {
    component: "routes/transactions.tsx",
    permissionsRequired: ["admin", "user"],
    path: "accounts/:accountId",
    authFailRedirect: "/",
    hideFromMenu: true,
  },
  users: {
    component: "routes/users.tsx",
    permissionsRequired: ["admin"],
    authFailRedirect: "/",
    sidebarIcon: <IconUsers size={16} stroke={1.5} />,
  },
  tasks: {
    component: "routes/tasks.tsx",
    permissionsRequired: ["admin"],
    authFailRedirect: "/",
    sidebarIcon: <IconEngine size={16} stroke={1.5} />,
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
    sidebarIcon: <IconLogout size={16} stroke={1.5} />,
  },
} as const satisfies Record<string, RouteSpec>;
