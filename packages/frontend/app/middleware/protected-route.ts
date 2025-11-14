import { getCurrentUser } from "@data";
import { redirect } from "react-router";

import { routesList } from "../routes-list.ts";
import { canAccess } from "./can-access.ts";

export const protectedRoute = ({
  routeName,
}: {
  routeName: keyof typeof routesList;
}) => {
  const routeConfig = routesList[routeName];
  return async () => {
    const user = await getCurrentUser();
    if (
      !canAccess({
        user,
        routeTags: routeConfig.permissionsRequired,
      })
    ) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect("/login");
    }
  };
};
