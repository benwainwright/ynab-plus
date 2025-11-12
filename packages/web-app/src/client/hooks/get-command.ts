import type { Commands } from "@ynab-plus/domain";
import { ClientError } from "../client-error.ts";
import { CommandClient } from "./command-client.ts";

export const getCommand = <TKey extends keyof Commands>(
  command: TKey,
  socket?: WebSocket,
) => {
  return async (data: Commands[TKey]["request"]) => {
    if (!socket) {
      throw new ClientError("Socket not initialised");
    }
    const client = new CommandClient(socket);
    return await client.send(command, data);
  };
};
