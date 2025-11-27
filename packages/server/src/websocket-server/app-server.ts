import {
  RequestContainerFactoryToken,
  type ISessionIdRequester,
} from "@ynab-plus/app";
import { ConfigValue, LoggerToken, type ILogger } from "@ynab-plus/bootstrap";
import { WebSocketServer } from "ws";

import { SessionIdHandler } from "./session-id-handler.ts";
import { ServerWebsocketClient } from "./websocket-client.ts";
import { inject, type Container, type ServiceIdentifier } from "inversify";

export const LOG_CONTEXT = {
  context: "app-server",
};

export const WebsocketServerPortConfigValueToken: ServiceIdentifier<
  ConfigValue<number>
> = Symbol.for("ServerPortConfigValue");

export const WebsocketServerHostConfigValueToken: ServiceIdentifier<
  ConfigValue<string>
> = Symbol.for("ServerHostConfigValue");

export class AppServer {
  private sessionIdHandler: SessionIdHandler;

  public constructor(
    @inject(RequestContainerFactoryToken)
    private requestContainerFactory: (
      containerFactory: ISessionIdRequester,
    ) => Promise<Container>,

    @inject(WebsocketServerPortConfigValueToken)
    private port: ConfigValue<number>,

    @inject(WebsocketServerHostConfigValueToken)
    private host: ConfigValue<string>,

    @inject(LoggerToken)
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

      const container = await this.requestContainerFactory({
        // eslint-disable-next-line @typescript-eslint/require-await
        getSessionId: async () => {
          return this.sessionIdHandler.getSessionId(request);
        },
      });

      const client = container.get(ServerWebsocketClient);

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      ws.on("message", client.onMessage.bind(client));
      ws.on("close", client.onClose.bind(client));

      client.onConnect(ws);
    });
  }
}
