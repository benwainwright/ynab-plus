import type { IEventBus, ServiceBusFactory } from "@application";
import type { BunRequest, Server } from "bun";
import { SessionIdHandler } from "./session-id-handler.ts";
import { ServerWebsocketClient } from "./websocket-client.ts";
import { ConfigValue } from "@bootstrap";

export class AppServer {
  public constructor(
    private serviceBusFactory: ServiceBusFactory,
    private eventBus: IEventBus,
    private indexPage: Bun.HTMLBundle,
    private developmentMode: ConfigValue<boolean>,
    private port: ConfigValue<number>,
  ) {}

  public async start() {
    return Bun.serve({
      port: await this.port.value,
      development: await this.developmentMode.value,
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
