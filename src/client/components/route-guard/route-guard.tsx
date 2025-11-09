import { useContext, type ReactNode } from "react";
import { Navigate } from "react-router";
import { CurrentUserContext } from "@client/hooks";
import { canAccess } from "./can-access.ts";

interface RouteGuardProps {
  children: ReactNode;
  routeName: string;
  routeTags: string[];
}

export const RouteGuard = ({ children, routeTags }: RouteGuardProps) => {
  const { user, finishedLoading } = useContext(CurrentUserContext);

  if (
    !canAccess({
      user,
      finishedLoading,
      routeTags,
    })
  ) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
