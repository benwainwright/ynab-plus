import type { ICommandMessage, IEventBus, IServiceBus } from "@ynab-plus/app";
import { AbstractError, type ILogger } from "@ynab-plus/bootstrap";
import { WebSocket } from "ws";
import z from "zod";

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

  private parseMessage(message: unknown) {
    const content =
      message instanceof Buffer
        ? JSON.stringify(message.toString("utf-8"))
        : typeof message === "string"
          ? JSON.stringify(message)
          : message;

    const commandMessage = z.object({
      id: z.string(),
      key: z.string(),
    });

    return commandMessage.parse(content) as ICommandMessage;
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
      if (error instanceof AbstractError) {
        error.handle(this.eventBus);
        return;
      }

      throw error;
    }
  }
}
