import { useContext, type ReactNode } from "react";
import { routesList } from "../../routes-list.ts";
import { canAccess } from "../../middleware/can-access.ts";
import { Navigate } from "react-router";
import { CurrentUserContext } from "@components";

interface ProtectedRouteProps {
  routeName: keyof typeof routesList;
  children: ReactNode;
}

export const ProtectedRoute = ({
  children,
  routeName,
}: ProtectedRouteProps) => {
  const { currentUser } = useContext(CurrentUserContext);
  if (
    !canAccess({
      user: currentUser,
      routeTags: routesList[routeName].permissionsRequired,
    })
  ) {
    return <Navigate to={routesList[routeName].authFailRedirect} />;
  }
  return <>{children}</>;
};
