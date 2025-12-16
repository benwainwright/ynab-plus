import { AppShell, NavLink } from "@mantine/core";
import { routesList, type RouteSpec } from "@config";
import { useContext, type ReactNode } from "react";
import { CurrentUserContext } from "@components";
import { canAccess } from "@utils";
import { Link, useLocation } from "react-router";

export const NavBar = (): ReactNode => {
  const location = useLocation();
  const { hash, pathname, search } = location;
  console.log({ hash, pathname, search });
  const list: Record<string, RouteSpec> = routesList;
  const { currentUser: user } = useContext(CurrentUserContext);
  return (
    <AppShell.Navbar>
      <ul>
        {Object.entries(list)
          .filter(
            ([, value]) =>
              canAccess({ user, routeTags: value.permissionsRequired }) && !value.hideFromMenu,
          )
          .map(([key, value]) => {
            const toString = value.isIndex ? "" : key;
            return (
              <NavLink
                key={`nav-bar-${key}`}
                active={
                  (toString.length === 0 && pathname === "/") ||
                  (toString.length > 0 && pathname.endsWith(toString))
                }
                component={Link}
                to={toString}
                label={`${key.charAt(0).toLocaleUpperCase()}${key.slice(1)}`}
                leftSection={value.sidebarIcon ? value.sidebarIcon : undefined}
              />
            );
          })}
      </ul>
    </AppShell.Navbar>
  );
};
