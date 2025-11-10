import { use } from "react";
import { getOpenSocket } from "./get-open-socket.ts";
import { CommandClient } from "./command-client.ts";
import type { IUser } from "@types";

let currentUser: Promise<IUser | undefined> | undefined;

export const getCurrentUser = () => {
  if (!currentUser) {
    const socket = use(getOpenSocket());
    const client = new CommandClient(socket);
    currentUser = client.send("GetCurrentUserCommand", undefined);
  }

  return currentUser;
};
