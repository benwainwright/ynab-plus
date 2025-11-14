import { CurrentUserContext } from "@components";
import { type ReactNode,useContext } from "react";
import { Navigate } from "react-router";

import { canAccess } from "../../middleware/can-access.ts";
import { routesList } from "../../routes-list.ts";

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
