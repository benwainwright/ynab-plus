import type { RequestScopedServiceBusFactory } from "@ynab-plus/app";
import { ConfigValue, type ILogger } from "@ynab-plus/bootstrap";
import { WebSocketServer } from "ws";

import { SessionIdHandler } from "./session-id-handler.ts";
import { ServerWebsocketClient } from "./websocket-client.ts";

export const LOG_CONTEXT = {
  context: "app-server",
};

export class AppServer {
  private sessionIdHandler: SessionIdHandler;

  public constructor(
    private serviceBusFactory: RequestScopedServiceBusFactory,
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

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    wss.on("listening", async () => {
      this.logger.info(
        `Websocket server listening on host ${await this.host.value}:${String(await this.port.value)}`,
        LOG_CONTEXT,
      );
    });

    wss.on("error", (error) => {
      this.logger.error(`Websocket server error ${error}`, {
        ...LOG_CONTEXT,
        error,
      });
    });

    wss.on("headers", (headers, request) => {
      this.sessionIdHandler.setSesionId(headers, request);
    });

    wss.on("close", () => {
      this.logger.info(`Websocket closed`, { ...LOG_CONTEXT });
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    wss.on("connection", async (ws, request) => {
      this.logger.debug("Websocket connection established", LOG_CONTEXT);

      const { serviceBus, eventBus, currentUserCache } =
        await this.serviceBusFactory({
          sessionIdRequester: {
            // eslint-disable-next-line @typescript-eslint/require-await
            getSessionId: async () => {
              return this.sessionIdHandler.getSessionId(request);
            },
          },
        });

      const client = new ServerWebsocketClient(
        serviceBus,
        eventBus,
        this.logger,
        currentUserCache,
      );

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      ws.on("message", client.onMessage.bind(client));
      ws.on("close", eventBus.removeAll.bind(eventBus));

      client.onConnect(ws);
    });
  }
}
