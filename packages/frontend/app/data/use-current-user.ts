import type { User } from "@ynab-plus/domain";
import { useEffect, useState } from "react";

import { getCurrentUser } from "./get-current-user.ts";

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<User>();
  const [dirty, setDirty] = useState(true);

  useEffect(() => {
    void (async () => {
      if (dirty) {
        const user = await getCurrentUser();
        setCurrentUser(user);
        setDirty(false);
      }
    })();
  }, [dirty]);

  return {
    currentUser,
    reloadUser: () => {
      setDirty(true);
    },
  };
};
