import { FrontendError } from "@errors";
import type { Commands } from "@ynab-plus/domain";
import { CommandClient } from "./command-client.ts";
import { getOpenSocket } from "./get-open-socket.ts";

export const command = async <TKey extends keyof Commands>(
  command: TKey,
  data: Commands[TKey]["request"],
) => {
  const socket = await getOpenSocket();
  if (!socket) {
    throw new FrontendError("Socket not initialised");
  }
  const client = new CommandClient(socket);
  return await client.send(command, data);
};
