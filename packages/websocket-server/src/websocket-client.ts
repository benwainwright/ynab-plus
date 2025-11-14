import type { IEventBus, IServiceBus } from "@ynab-plus/app";
import type { ILogger } from "@ynab-plus/bootstrap";
import { WebSocket } from "ws";

import { WebAppError } from "./web-app-error.ts";

export const LOG_CONTEXT = {
  context: "websocket-server-socket-client",
};

export class ServerWebsocketClient {
  public constructor(
    private serviceBus: IServiceBus,
    private eventBus: IEventBus,
    private logger: ILogger,
  ) {}

  public onConnect(socket: WebSocket) {
    this.logger.debug(`Socket connected`, LOG_CONTEXT);
    this.eventBus.emit("SocketOpened", undefined);
    this.eventBus.onAll((packet) => {
      this.logger.debug(`Event recieved`, { ...LOG_CONTEXT, packet });
      socket.send(JSON.stringify(packet));
    });
  }

  private parseMessage(message: WebSocket.RawData) {
    if (message instanceof Buffer) {
      return JSON.parse(message.toString("utf-8"));
    }

    if (typeof message === "object") {
      return message;
    }
    if (typeof message === "string") {
      return JSON.parse(message);
    }

    throw new WebAppError(`Message had unexpected type`);
  }

  public async onMessage(message: WebSocket.RawData) {
    this.logger.silly(`Message received on socket`, LOG_CONTEXT);
    try {
      const parsed = this.parseMessage(message);

      this.logger.debug(`Message parsed`, {
        ...LOG_CONTEXT,
        message: JSON.stringify(parsed),
      });

      const response = await this.serviceBus.handleCommand(parsed);

      this.eventBus.emit("CommandResponse", {
        id: parsed.id,
        key: parsed.key,
        data: response,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        "handle" in error &&
        typeof error.handle === "function"
      ) {
        error.handle(this.eventBus);
        return;
      }

      throw error;
    }
  }
}
