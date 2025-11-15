import type { User } from "@ynab-plus/domain";
import { useEffect, useState, useTransition } from "react";

import { command } from "./command.ts";

export const useUsers = (offset: number, limit: number) => {
  const [isPending, startTransition] = useTransition();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    startTransition(async () => {
      setUsers(await command("ListUsersCommand", { offset, limit }));
    });
  }, []);

  return { isPending, users };
};
