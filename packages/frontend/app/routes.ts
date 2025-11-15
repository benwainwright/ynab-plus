import {
  index,
  layout,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

import { routesList, type RouteSpec } from "./routes-list.ts";

const list: Record<string, RouteSpec> = routesList;

const routes = [
  layout(
    "routes/app-layout.tsx",
    Object.entries(list).map(([key, value]) =>
      value.isIndex
        ? index(value.component)
        : route(value.path ? value.path : key, value.component),
    ),
  ),
];

export default routes satisfies RouteConfig;
