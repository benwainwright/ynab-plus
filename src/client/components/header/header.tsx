import { CurrentUserContext } from "@client/hooks";
import { useContext } from "react";
import { canAccess, routes } from "@client/components";
import { Link } from "react-router";

interface HeaderProps {
  title: string;
}
export const Header = ({ title }: HeaderProps) => {
  const { user, finishedLoading } = useContext(CurrentUserContext);

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
                finishedLoading,
                routeTags: route.tags,
              }),
            )
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
