import { useContext, type ReactNode } from "react";
import { Navigate } from "react-router";
import { CurrentUserContext } from "@client/hooks";

interface RouteGuardProps {
  children: ReactNode;
}

export const RouteGuard = ({ children }: RouteGuardProps) => {
  const { user, finishedLoading } = useContext(CurrentUserContext);
  if (finishedLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
