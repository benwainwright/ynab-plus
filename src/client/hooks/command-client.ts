import { v7 } from "uuid";
import type { ICommandMessage } from "@types";
import { SocketEventListener } from "./socket-event-listener.ts";

export class CommandClient {
  public constructor(private socket: WebSocket) {}

  public async send<TName extends keyof Commands>(
    command: TName,
    data: Commands[TName]["request"],
  ): Promise<Commands[TName]["response"]> {
    const uuid = v7();

    const message: ICommandMessage<TName> = {
      key: command,
      id: uuid,
      data,
    };

    this.socket.send(JSON.stringify(message));

    using listener = new SocketEventListener(this.socket);

    return await new Promise((accept) =>
      listener.on("CommandResponse", (data) => {
        if (data.id === uuid && data.key === command) {
          accept(data.data);
        }
      }),
    );
  }
}
