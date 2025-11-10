import { AppError } from "@errors";
import type { IEventBus, IServiceBus } from "@application";

export class ServerWebsocketClient {
  public constructor(
    private serviceBus: IServiceBus,
    private eventBus: IEventBus,
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

        const response = await this.serviceBus.handleCommand(parsed);

        this.eventBus.emit("CommandResponse", {
          id: parsed.id,
          key: parsed.key,
          data: response,
        });
      }
    } catch (error) {
      // TODO handle web app errors only here, application should be handling its own errors
      if (error instanceof AppError) {
        error.handle(this.eventBus);
      }
    }
  }
}
