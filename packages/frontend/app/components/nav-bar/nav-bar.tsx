import { AppShell, NavLink } from "@mantine/core";
import { routesList, type RouteSpec } from "@config";
import { useContext } from "react";
import { CurrentUserContext } from "@components";
import { canAccess } from "@utils";
import { Link } from "react-router";

export const NavBar = () => {
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
              label={key}
              leftSection={value.sidebarIcon ? value.sidebarIcon : undefined}
            />
          ))}
      </ul>
    </AppShell.Navbar>
  );
};
