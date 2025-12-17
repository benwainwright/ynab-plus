import type { Commands, ICommandMessage } from "@ynab-plus/domain";
import { v7 } from "uuid";

import { SocketEventListener } from "./socket-event-listener.ts";
import { Serialiser } from "@ynab-plus/serialiser";

export class CommandClient {
  public constructor(private socket: WebSocket) {}

  public async send<TName extends keyof Commands>(
    command: TName,
    data: Commands[TName]["request"]
  ): Promise<Commands[TName]["response"]> {
    const uuid = v7();

    const message: ICommandMessage<TName> = {
      key: command,
      id: uuid,
      data
    };

    const serialiser = new Serialiser();

    this.socket.send(serialiser.serialise(message));

    const listener = new SocketEventListener(this.socket);
    try {
      return await new Promise((accept) =>
        listener.on("CommandResponse", (data) => {
          if (data.id === uuid && data.key === command) {
            accept(data.data);
          }
        })
      );
    } finally {
      listener.removeAll();
    }
  }
}
