import { Route, Routes } from "react-router";

import { Dashboard, Login, Register, RouteGuard } from "@client/components";

import type { IUser } from "@types";

interface AppRouteProps {
  currentUser: IUser | undefined;
  currentUserLoaded: boolean;
}

export const AppRoutes = ({
  currentUser,
  currentUserLoaded,
}: AppRouteProps) => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RouteGuard
            currentUser={currentUser}
            currentUserLoaded={currentUserLoaded}
          >
            <Dashboard />
          </RouteGuard>
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};
