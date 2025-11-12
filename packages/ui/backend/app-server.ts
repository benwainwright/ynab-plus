import type { IEventBus, ServiceBusFactory } from "@ynab-plus/app";
import { SessionIdHandler } from "./session-id-handler.ts";
import { ServerWebsocketClient } from "./websocket-client.ts";
import { ConfigValue } from "@ynab-plus/bootstrap";
import { WebSocketServer } from "ws";

export class AppServer {
  public constructor(
    private serviceBusFactory: ServiceBusFactory,
    private eventBus: IEventBus,
    private port: ConfigValue<number>,
  ) {}

  public async start() {
    const wss = new WebSocketServer({
      port: await this.port.value,
    });

    wss.on("connection", async (ws, request) => {
      const { serviceBus, eventBus } = await this.serviceBusFactory({
        sessionIdRequester: new SessionIdHandler(ws, request),
      });
      const client = new ServerWebsocketClient(serviceBus, eventBus);
      wss.on("open", () => client.onOpen(ws));
      ws.on("message", (message) => client.onMessage(message));
    });
  }
}
