import type { IEventBus, IServerSocketClient, ISessionData } from "@types";
import { Container, inject, injectable } from "inversify";
import type { Server } from "bun";
import {
  devModeToken,
  eventBusToken,
  indexPageToken,
  requestToken,
  serverSocketClient,
  userIdSessionStore,
} from "@tokens";
import type { SessionStorage } from "./session-storage.ts";

@injectable()
export class AppServer {
  public constructor(
    @inject(eventBusToken)
    private eventBus: IEventBus,

    @inject(devModeToken)
    private developmentMode: boolean,

    @inject(indexPageToken)
    private indexPage: Bun.HTMLBundle,

    @inject(userIdSessionStore)
    private sessionStorage: SessionStorage<ISessionData>,

    @inject(Container)
    private container: Container,
  ) {}

  public start() {
    return Bun.serve({
      port: 3015,
      development: this.developmentMode ?? false,
      routes: {
        "/": this.indexPage,
        "/socket": (
          request,
          server: Server<{ client: IServerSocketClient }>,
        ) => {
          const requestContainer = new Container({
            parent: this.container,
          });

          requestContainer.bind(requestToken).toConstantValue(request);

          const childEventBus = this.eventBus.child(
            this.sessionStorage.getSessionId(),
          );
          requestContainer.bind(eventBusToken).toConstantValue(childEventBus);

          if (
            server.upgrade(request, {
              data: {
                client: requestContainer.get(serverSocketClient),
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
