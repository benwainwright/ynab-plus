import { use, type ReactNode } from "react";
import { Navigate } from "react-router";
import { canAccess } from "./can-access.ts";
import { getCurrentUser } from "@hooks";

interface RouteGuardProps {
  children: ReactNode;
  routeName: string;
  routeTags: string[];
}

export const RouteGuard = ({ children, routeTags }: RouteGuardProps) => {
  const user = use(getCurrentUser());
  if (
    !canAccess({
      user,
      routeTags,
    })
  ) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
