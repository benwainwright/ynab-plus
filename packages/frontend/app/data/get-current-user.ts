import { CommandClient } from "./command-client.ts";
import { getOpenSocket } from "./get-open-socket.ts";

export const getCurrentUser = async () => {
  const socket = await getOpenSocket();
  const client = new CommandClient(socket);
  return client.send("GetCurrentUserCommand", undefined);
};
