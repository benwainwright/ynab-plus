import type { ReactElement } from "react";
import {
  Dashboard,
  EditUser,
  Login,
  Logout,
  Register,
  Users,
} from "@components";

interface Route {
  render: () => ReactElement;
  name: string;
  tags: string[];
  path: string;
  hideInMenu?: boolean;
  public?: boolean;
  children?: Route[];
}

export const routes: Route[] = [
  {
    path: "login",
    name: "login",
    tags: ["public"],
    render: () => <Login />,
  },
  {
    path: "logout",
    name: "logout",
    tags: ["user"],
    render: () => <Logout />,
  },
  {
    path: "register",
    tags: ["public"],
    name: "register",
    render: () => <Register />,
  },
  {
    path: "users",
    tags: ["user"],
    name: "users",
    render: () => <Users />,
  },
  {
    path: "users/edit/:userId",
    tags: ["user"],
    name: "editUser",
    hideInMenu: true,
    render: () => <EditUser />,
  },
  {
    path: "",
    tags: ["user"],
    name: "home",
    render: () => <Dashboard />,
  },
];
