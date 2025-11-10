import { CommandClient } from "./command-client.ts";
import { AppError } from "@errors";

export const getCommand = <TKey extends keyof Commands>(
  command: TKey,
  socket?: WebSocket,
) => {
  return async (data: Commands[TKey]["request"]) => {
    if (!socket) {
      throw new AppError("Socket not initialised");
    }
    const client = new CommandClient(socket);
    return await client.send(command, data);
  };
};
