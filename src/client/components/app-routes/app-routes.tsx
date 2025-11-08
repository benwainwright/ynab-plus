import { Route, Routes } from "react-router";

import { Dashboard, Login, Register, RouteGuard } from "@client/components";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RouteGuard>
            <Dashboard />
          </RouteGuard>
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};
