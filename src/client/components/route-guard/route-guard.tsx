import type { IUser } from "@types";
import type { ReactNode } from "react";
import { Navigate } from "react-router";

interface RouteGuardProps {
  currentUser: IUser | undefined;
  children: ReactNode;
}

export const RouteGuard = ({ currentUser, children }: RouteGuardProps) => {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
