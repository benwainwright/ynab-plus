import type { IEventBus } from "@types";
import { Container, inject, injectable } from "inversify";
import { devModeToken, eventBusToken, indexPageToken } from "@tokens";
import { socketRequestHandler } from "./socket-request-handler.ts";

@injectable()
export class AppServer {
  public constructor(
    @inject(eventBusToken)
    private eventBus: IEventBus,

    @inject(devModeToken)
    private developmentMode: boolean,

    @inject(indexPageToken)
    private indexPage: Bun.HTMLBundle,

    @inject(Container)
    private container: Container,
  ) {}

  public start() {
    return Bun.serve({
      port: 3015,
      development: this.developmentMode ?? false,
      routes: {
        "/": this.indexPage,
        "/socket": socketRequestHandler(this.container, this.eventBus),
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
