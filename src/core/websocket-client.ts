import type { IEventBus, ISessionData } from "@types";

import StackTracey from "stacktracey";

import type { CommandHandler } from "./command-handler.ts";
import { AppError } from "@errors";
import type { SessionStorage } from "./session-storage.ts";

export class ServerWebsocketClient {
  public constructor(
    private handlers: CommandHandler<keyof Commands>[],
    private eventBus: IEventBus,
    private sessionStorage: SessionStorage<ISessionData>,
  ) {}

  public async onOpen(socket: Bun.ServerWebSocket<unknown>) {
    this.eventBus.emit("SocketOpened", undefined);
    this.eventBus.onAll((packet) => {
      socket.send(JSON.stringify(packet));
    });
  }

  public async onMessage(
    _socket: Bun.ServerWebSocket<unknown>,
    message: string | Buffer<ArrayBuffer>,
  ) {
    try {
      if (typeof message === "string") {
        const parsed = JSON.parse(message);

        const handler = this.handlers.find((handler) =>
          handler.canHandle(parsed),
        );

        if (!handler) {
          throw new AppError("Handler not found");
        }

        const response = await handler.handle({
          command: parsed,
          eventBus: this.eventBus,
          session: this.sessionStorage,
        });

        this.eventBus.emit("CommandResponse", {
          key: handler.commandName,
          data: response,
          id: parsed.id,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        const stack = new StackTracey(error);
        const parsedStack = stack.items.map((item) => ({
          calee: item.callee,
          file: `${item.fileRelative}:${item.line}:${item.column}`,
        }));
        this.eventBus.emit("ApplicationError", {
          stack: parsedStack,
          message: error.message,
        });
      }
    }
  }
}
