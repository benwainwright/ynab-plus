import { useEffect, useState } from "react";
import { CommandClient } from "./command-client.ts";
import { SocketEventListener } from "./socket-event-listener.ts";
import { ClientError } from "./client-error.ts";

export const useServer = (socketUrl: string) => {
  const [socket, setSocket] = useState<WebSocket | undefined>();
  const [clients, setClients] = useState<
    | {
        command: CommandClient;
        events: SocketEventListener;
      }
    | undefined
  >();

  useEffect(() => {
    setSocket(new WebSocket(socketUrl));
  }, [socketUrl]);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.addEventListener("open", () => {
      setClients({
        command: new CommandClient(socket),
        events: new SocketEventListener(socket),
      });
    });
  }, [socket]);

  return {
    initialised: Boolean(clients),

    sendCommand: async <TName extends keyof Commands>(
      command: TName,
      data: Commands[TName]["request"],
    ): Promise<Commands[TName]["response"]> => {
      if (!clients) {
        throw new ClientError("Socket not initialised");
      }
      return await clients.command.send(command, data);
    },

    listen: () => {},
  };
};
