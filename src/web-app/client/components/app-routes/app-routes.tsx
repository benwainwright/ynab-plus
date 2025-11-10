import { Route, Routes } from "react-router";

import { routes } from "./routes.tsx";
import { RouteGuard } from "@client/components";

export const AppRoutes = () => {
  return (
    <Routes>
      {routes.map((route) => {
        const children = route.children
          ? route.children.map((child) => (
              <Route
                path={child.path}
                element={
                  <RouteGuard routeTags={child.tags} routeName={child.name}>
                    {child.render()}
                  </RouteGuard>
                }
              />
            ))
          : undefined;
        return (
          <Route
            path={route.path}
            element={
              <RouteGuard routeTags={route.tags} routeName={route.name}>
                {route.render()}
              </RouteGuard>
            }
          >
            {children}
          </Route>
        );
      })}
    </Routes>
  );
};
