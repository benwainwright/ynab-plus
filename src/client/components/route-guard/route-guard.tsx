import type { IUser } from "@types";
import type { ReactNode } from "react";
import { Navigate } from "react-router";

interface RouteGuardProps {
  currentUser: IUser | undefined;
  currentUserLoaded: boolean;
  children: ReactNode;
}

export const RouteGuard = ({
  currentUser,
  children,
  currentUserLoaded,
}: RouteGuardProps) => {
  if (currentUserLoaded && !currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
