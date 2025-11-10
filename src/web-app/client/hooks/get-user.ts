import { use } from "react";
import { getOpenSocket } from "./get-open-socket.ts";
import { CommandClient } from "./command-client.ts";
import type { User } from "@domain";

const userCache = new Map<string, Promise<User | undefined>>();

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
