import type { IEventBus, IServiceBus } from "@ynab-plus/app";
import { WebAppError } from "./web-app-error.ts";
import { WebSocket } from "ws";

export class ServerWebsocketClient {
  public constructor(
    private serviceBus: IServiceBus,
    private eventBus: IEventBus,
  ) {}

  public async onOpen(socket: WebSocket) {
    console.log("ONOPEN");
    this.eventBus.emit("SocketOpened", undefined);
    this.eventBus.onAll((packet) => {
      console.log("PACKET", packet);
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
    console.log(message.toString("utf-8"));
    try {
      const parsed = this.parseMessage(message);
      console.log(parsed);

      const response = await this.serviceBus.handleCommand(parsed);
      console.log("after");

      this.eventBus.emit("CommandResponse", {
        id: parsed.id,
        key: parsed.key,
        data: response,
      });
    } catch (error) {
      console.log(error);
      // TODO handle web app errors only here, application should be handling its own errors
      if (error instanceof WebAppError) {
        error.handle(this.eventBus);
      }
    }
  }
}
