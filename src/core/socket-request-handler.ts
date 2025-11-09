import {
  eventBusToken,
  requestToken,
  serverSocketClient,
  userIdSessionStore,
} from "@tokens";
import type { IEventBus, IServerSocketClient } from "@types";
import type { BunRequest, Server } from "bun";
import { Container } from "inversify";

export const socketRequestHandler =
  (container: Container, eventBus: IEventBus) =>
  (request: BunRequest, server: Server<{ client: IServerSocketClient }>) => {
    const requestContainer = new Container({
      parent: container,
    });

    requestContainer.bind(requestToken).toConstantValue(request);
    const sessionStorage = requestContainer.get(userIdSessionStore);
    const childEventBus = eventBus.child(sessionStorage.getSessionId());

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
  };
