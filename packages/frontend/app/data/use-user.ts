import type { IUser, Permission } from "@ynab-plus/domain";
import { useCallback, useEffect, useState, useTransition } from "react";

import { command } from "./command.ts";
import { useEvent } from "./use-event.ts";

interface ILocalUser {
  username: string;
  email: string;
  password: string;
  permissions: Permission[];
}

export const useUser = (username?: string) => {
  const [isPending, startTransition] = useTransition();

  const [user, setUser] = useState<ILocalUser | undefined>();

  const mapUser = (user: IUser): ILocalUser => ({
    username: user.id,
    permissions: user.permissions,
    password: "",
    email: user.email,
  });

  useEffect(() => {
    if (username) {
      startTransition(async () => {
        const user = await command("GetUserCommand", { username });
        if (user) {
          setUser(mapUser(user));
        }
      });
    }
  }, [username]);

  const saveUser = useCallback(async () => {
    if (user) {
      await command("UpdateUserCommand", user);
    }
  }, [username]);

  useEvent("UserUpdated", (updatedUser) => {
    setUser(mapUser(updatedUser));
  });

  return { isPending, user, setUser, saveUser };
};
