import {
  inject,
  type IEventBus,
  type IServiceBus,
  type ISingleItemStore,
} from "@ynab-plus/app";
import { AbstractError, type ILogger } from "@ynab-plus/bootstrap";
import { Command, User, type ICommandMessage } from "@ynab-plus/domain";
import { Serialiser } from "@ynab-plus/serialiser";
import { injectable } from "inversify";
import { WebSocket } from "ws";
import z from "zod";

export const LOG_CONTEXT = {
  context: "websocket-server-socket-client",
};

@injectable()
export class ServerWebsocketClient {
  public constructor(
    @inject("ServiceBus")
    private serviceBus: IServiceBus,

    @inject("EventBus")
    private eventBus: IEventBus,

    @inject("Logger")
    private logger: ILogger,

    @inject("SessionStore")
    private currentUserCache: ISingleItemStore<User>,
  ) {}

  public onConnect(socket: WebSocket) {
    this.logger.debug(`Socket connected`, LOG_CONTEXT);
    this.eventBus.onAll((packet) => {
      this.logger.debug(`Event recieved`, { ...LOG_CONTEXT, packet });
      const serialiser = new Serialiser();
      const toSend = serialiser.serialise(packet);
      socket.send(toSend);
    });
  }

  private parseMessage(message: unknown) {
    const content =
      message instanceof Buffer
        ? (JSON.parse(message.toString("utf-8")) as Record<string, unknown>)
        : typeof message === "string"
          ? (JSON.parse(message) as Record<string, unknown>)
          : message;

    const commandMessage = z.object({
      id: z.string(),
      key: z.string(),
      data: z.any(),
    });

    return commandMessage.parse(content) as ICommandMessage;
  }

  public onClose() {
    this.eventBus.removeAll();
  }

  public async onMessage(message: WebSocket.RawData) {
    this.logger.silly(`Message received on socket`, LOG_CONTEXT);
    try {
      const parsed = this.parseMessage(message);

      this.logger.debug(`Message parsed`, {
        ...LOG_CONTEXT,
        message: JSON.stringify(parsed),
      });

      const command = new Command(
        parsed.key,
        parsed.data,
        await this.currentUserCache.get(),
      );

      const response = await this.serviceBus.execute(command);

      this.eventBus.emit("CommandResponse", {
        id: parsed.id,
        key: parsed.key,
        data: response,
      });
    } catch (error) {
      if (error instanceof AbstractError) {
        this.logger.error(
          `${error.message}, ${String(error.stack)}`,
          LOG_CONTEXT,
        );
        error.handle(this.eventBus);
        return;
      } else if (error instanceof Error) {
        this.logger.error(
          `${error.message}, ${String(error.stack)}`,
          LOG_CONTEXT,
        );
      } else {
        this.logger.error(String(error), LOG_CONTEXT);
      }
    }
  }
}
