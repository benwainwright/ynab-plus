import { useState } from "react";
import { CommandClient } from "./command-client.ts";
import { ClientError } from "./client-error.ts";

export const useCommand = <TKey extends keyof Commands>(
  command: TKey,
  socket?: WebSocket,
) => {
  const [sending, setSending] = useState(false);
  const [result, setCommandResult] = useState<
    Commands[TKey]["response"] | undefined
  >();

  const send = async (data: Commands[TKey]["request"]) => {
    if (!socket) {
      throw new ClientError("Socket not initialised");
    }
    const client = new CommandClient(socket);
    setSending(true);
    const result = await client.send(command, data);
    setCommandResult(result);
  };

  return { sending, result, send };
};
