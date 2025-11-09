import type { IEventBus, IServerSocketClient, ISessionData } from "@types";

import type { CommandHandler } from "./command-handler.ts";
import { AppError, HandlerNotFoundError } from "@errors";
import type { SessionStorage } from "./session-storage.ts";
import { inject, injectable, multiInject } from "inversify";
import { eventBusToken, handlerToken, userIdSessionStore } from "@tokens";

@injectable()
export class ServerWebsocketClient implements IServerSocketClient {
  public constructor(
    @multiInject(handlerToken)
    private handlers: CommandHandler<keyof Commands>[],

    @inject(eventBusToken)
    private eventBus: IEventBus,

    @inject(userIdSessionStore)
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
          throw new HandlerNotFoundError(message);
        }

        await handler.doHandle({
          command: parsed,
          eventBus: this.eventBus,
          session: this.sessionStorage,
        });
      }
    } catch (error) {
      if (error instanceof AppError) {
        error.handle(this.eventBus);
      }
    }
  }
}
