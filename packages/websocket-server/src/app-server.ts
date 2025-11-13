import { ConfigValue, type ILogger } from "@ynab-plus/bootstrap";
import type { ServiceBusFactory } from "@ynab-plus/app";

import { SessionIdHandler } from "./session-id-handler.ts";
import { ServerWebsocketClient } from "./websocket-client.ts";
import { WebSocketServer } from "ws";

export const LOG_CONTEXT = {
  context: "app-server",
};

export class AppServer {
  private sessionIdHandler: SessionIdHandler;

  public constructor(
    private serviceBusFactory: ServiceBusFactory,
    private port: ConfigValue<number>,
    private host: ConfigValue<string>,
    private logger: ILogger,
  ) {
    this.sessionIdHandler = new SessionIdHandler(logger);
  }

  public async start() {
    const wss = new WebSocketServer({
      port: await this.port.value,
      host: await this.host.value,
    });

    wss.on("listening", async () => {
      this.logger.info(
        `Websocket server listening on host ${await this.host.value}:${await this.port.value}`,
        LOG_CONTEXT,
      );
    });

    wss.on("error", (error) => {
      this.logger.error(`Websocket server error`, { ...LOG_CONTEXT, error });
    });

    wss.on("headers", (headers, request) => {
      this.sessionIdHandler.setSesionId(headers, request);
    });

    wss.on("close", () => {
      this.logger.info(`Websocket closed`, { ...LOG_CONTEXT });
    });

    wss.on("connection", async (ws, request) => {
      this.logger.debug("Websocket connection established", LOG_CONTEXT);

      const { serviceBus, eventBus } = await this.serviceBusFactory({
        sessionIdRequester: {
          getSessionId: async () => {
            return this.sessionIdHandler.getSessionId(request);
          },
        },
      });

      const client = new ServerWebsocketClient(
        serviceBus,
        eventBus,
        this.logger,
      );

      ws.on("message", client.onMessage.bind(client));

      client.onConnect(ws);
    });
  }
}
