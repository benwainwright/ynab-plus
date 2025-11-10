import { getCurrentUser } from "@client/hooks";
import { canAccess, routes } from "@client/components";
import { Link } from "react-router";
import { use } from "react";

interface HeaderProps {
  title: string;
}
export const Header = ({ title }: HeaderProps) => {
  const user = use(getCurrentUser());

  return (
    <header>
      <nav>
        <ul>
          <li>
            <h1>{title}</h1>
          </li>
        </ul>
        <ul>
          {routes
            .filter((route) =>
              canAccess({
                user,
                routeTags: route.tags,
              }),
            )
            .filter((route) => !route.hideInMenu)
            .map((route) => (
              <li>
                <Link to={route.path}>{route.name}</Link>
              </li>
            ))}
        </ul>
      </nav>
    </header>
  );
};
