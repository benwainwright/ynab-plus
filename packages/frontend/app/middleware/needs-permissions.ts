import { getCurrentUser } from "@data";
import type { Permission } from "@ynab-plus/domain";
import { redirect } from "react-router";

import { canAccess } from "./can-access.ts";

export const needsPermissions = (routeTags: Permission[]) => {
  return async () => {
    const user = await getCurrentUser();
    if (
      !canAccess({
        user,
        routeTags,
      })
    ) {
      throw redirect("/login");
    }
  };
};
