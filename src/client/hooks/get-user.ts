import { use } from "react";
import { getOpenSocket } from "./get-open-socket.ts";
import { CommandClient } from "./command-client.ts";
import type { IUser } from "@types";

const userCache = new Map<string, Promise<IUser | undefined>>();

export const getUser = (username: string) => {
  const user = userCache.get(username);

  if (!user) {
    const socket = use(getOpenSocket());
    const client = new CommandClient(socket);
    const userPromise = client.send("GetUser", { username });
    userCache.set(username, userPromise);
    return userPromise;
  }

  return user;
};
