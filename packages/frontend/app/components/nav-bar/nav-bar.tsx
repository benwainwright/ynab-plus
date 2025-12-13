import { AppShell, NavLink } from "@mantine/core";
import { routesList, type RouteSpec } from "@config";
import { useContext, type ReactNode } from "react";
import { CurrentUserContext } from "@components";
import { canAccess } from "@utils";
import { Link } from "react-router";

export const NavBar = (): ReactNode => {
  const list: Record<string, RouteSpec> = routesList;
  const { currentUser: user } = useContext(CurrentUserContext);
  return (
    <AppShell.Navbar>
      <ul>
        {Object.entries(list)
          .filter(
            ([, value]) =>
              canAccess({ user, routeTags: value.permissionsRequired }) &&
              !value.hideFromMenu,
          )
          .map(([key, value]) => (
            <NavLink
              key={`nav-bar-${key}`}
              component={Link}
              to={value.isIndex ? "" : key}
              label={`${key.charAt(0).toLocaleUpperCase()}${key.slice(1)}`}
              leftSection={value.sidebarIcon ? value.sidebarIcon : undefined}
            />
          ))}
      </ul>
    </AppShell.Navbar>
  );
};
