import type { IEventBus, ServiceBusFactory } from "@application";
import type { BunRequest, Server } from "bun";
import { SessionIdHandler } from "./session-id-handler.ts";
import { ServerWebsocketClient } from "./websocket-client.ts";

export class AppServer {
  public constructor(
    private serviceBusFactory: ServiceBusFactory,
    private eventBus: IEventBus,
    private developmentMode: boolean,
    private indexPage: Bun.HTMLBundle,
  ) {}

  public start() {
    return Bun.serve({
      port: 3015,
      development: this.developmentMode ?? false,
      routes: {
        "/": this.indexPage,
        "/socket": async (
          request: BunRequest,
          server: Server<{ client: ServerWebsocketClient }>,
        ) => {
          const serviceBus = await this.serviceBusFactory({
            sessionIdRequester: new SessionIdHandler(request),
          });
          if (
            server.upgrade(request, {
              data: {
                client: new ServerWebsocketClient(serviceBus, this.eventBus),
              },
            })
          ) {
            return;
          }
          return new Response("Upgrade failed", { status: 500 });
        },
      },
      websocket: {
        open: async (ws) => {
          await ws.data.client.onOpen(ws);
        },
        message: async (ws, message) => {
          await ws.data.client.onMessage(ws, message);
        },
      },
    });
  }
}
