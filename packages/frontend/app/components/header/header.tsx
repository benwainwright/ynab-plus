import type { User } from "@ynab-plus/domain";
import { CurrentUserContext, CurrentUserProvider } from "@components";
import { Link } from "react-router";

import { canAccess } from "../../middleware/can-access.ts";
import { routesList, type RouteSpec } from "../../routes-list.ts";
import { useContext } from "react";

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
            .filter(([, value]) =>
              canAccess({ user, routeTags: value.permissionsRequired }),
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
