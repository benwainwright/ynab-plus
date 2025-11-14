import { use } from "react";
import type { User } from "@ynab-plus/domain";
import { getOpenSocket } from "./get-open-socket.ts";
import { CommandClient } from "./command-client.ts";

let currentUser: Promise<User | undefined> | undefined;

export const getCurrentUser = async () => {
  if (!currentUser) {
    const socket = await getOpenSocket();
    const client = new CommandClient(socket);
    currentUser = client.send("GetCurrentUserCommand", undefined);
  }

  return currentUser;
};
