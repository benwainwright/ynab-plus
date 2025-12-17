import { type ISessionIdRequester } from "@ynab-plus/app";
import { ConfigValue, type ILogger, type IStartable } from "@ynab-plus/bootstrap";
import { WebSocketServer } from "ws";

import { SessionIdHandler } from "./session-id-handler.ts";
import { inject, type IInternalTypes } from "@core";
import type { TypedContainer } from "@inversifyjs/strongly-typed";

export const LOG_CONTEXT = {
  context: "app-server"
};

export class AppServer implements IStartable {
  private sessionIdHandler: SessionIdHandler;

  public readonly name = "Websocket Server";

  public constructor(
    @inject("ContainerFactory")
    private requestContainerFactory: (
      sessionIdRequester: ISessionIdRequester
    ) => Promise<TypedContainer<IInternalTypes>>,
    @inject("WebsocketServerPort")
    private port: ConfigValue<number>,

    @inject("WebsocketServerHost")
    private host: ConfigValue<string>,

    @inject("Logger")
    private logger: ILogger
  ) {
    this.sessionIdHandler = new SessionIdHandler(logger);
  }

  public async start() {
    const wss = new WebSocketServer({
      port: await this.port.value,
      host: await this.host.value
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    wss.on("listening", async () => {
      this.logger.info(
        `Websocket server listening on host ${await this.host.value}:${String(await this.port.value)}`,
        LOG_CONTEXT
      );
    });

    wss.on("error", (error) => {
      this.logger.error(`Websocket server error ${error}`, {
        ...LOG_CONTEXT,
        error
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
        }
      });

      const client = await container.getAsync("ServerWebsocketClient");

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      ws.on("message", client.onMessage.bind(client));
      ws.on("close", client.onClose.bind(client));

      client.onConnect(ws);
    });
  }
}
