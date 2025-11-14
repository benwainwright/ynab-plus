import type { User } from "@ynab-plus/domain";
import { useEffect, useState } from "react";

import { getCurrentUser } from "./get-current-user.ts";

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<User>();
  const [dirty, setDirty] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    void (async () => {
      if (dirty) {
        const user = await getCurrentUser();
        setCurrentUser(user);
        setDirty(false);
        setInitialLoadComplete(true);
      }
    })();
  }, [dirty]);

  return {
    currentUser,
    initialLoadComplete,
    reloadUser: () => {
      setDirty(true);
    },
  };
};
