import { CurrentUserContext } from "@components";
import { useContext } from "react";
import { Link } from "react-router";

import { canAccess } from "../../middleware/can-access.ts";
import { routesList, type RouteSpec } from "../../routes-list.ts";

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  const list: Record<string, RouteSpec> = routesList;
  const { currentUser: user } = useContext(CurrentUserContext);
  return (
    <header>
      <nav>
        <ul>
          <li>
            <hgroup>
              <h1>{title}</h1>
              {user ? <p>hello {user.id}</p> : <p>Logged out...</p>}
            </hgroup>
          </li>
        </ul>
        <ul>
          {Object.entries(list)
            .filter(
              ([, value]) =>
                canAccess({ user, routeTags: value.permissionsRequired }) &&
                !value.hideFromMenu,
            )
            .map(([key, value]) => (
              <li>
                <Link to={value.isIndex ? "" : key}>{key}</Link>
              </li>
            ))}
        </ul>
      </nav>
    </header>
  );
};
