import { use } from "react";
import { getOpenSocket } from "./get-open-socket.ts";
import { CommandClient } from "./command-client.ts";
import type { User } from "@ynab-plus/domain";

let currentUser: Promise<User | undefined> | undefined;

export const getCurrentUser = () => {
  if (!currentUser) {
    const socket = use(getOpenSocket());
    const client = new CommandClient(socket);
    currentUser = client.send("GetCurrentUserCommand", undefined);
  }

  return currentUser;
};
