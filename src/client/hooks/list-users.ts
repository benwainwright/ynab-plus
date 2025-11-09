import type { IUser } from "@types";
import { use } from "react";
import { getOpenSocket } from "./get-open-socket.ts";
import { CommandClient } from "./command-client.ts";

const usersCache = new Map<string, Promise<IUser[]>>();

export const listUsers = (offset: number, limit: number) => {
  const key = `${offset}-${limit}`;
  const users = usersCache.get(key);

  if (!users) {
    const socket = use(getOpenSocket());
    const client = new CommandClient(socket);

    const usersPromise = client.send("ListUsersCommand", {
      offset,
      limit,
    });

    usersCache.set(key, usersPromise);
    return usersPromise;
  }

  return users;
};
