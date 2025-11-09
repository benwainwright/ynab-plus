import { Route, Routes } from "react-router";

import { routes } from "./routes.tsx";
import { RouteGuard } from "@client/components";

export const AppRoutes = () => {
  return (
    <Routes>
      {routes.map((route) => (
        <Route
          path={route.path}
          element={
            <RouteGuard routeTags={route.tags} routeName={route.name}>
              {route.render()}
            </RouteGuard>
          }
        />
      ))}
    </Routes>
  );
};
