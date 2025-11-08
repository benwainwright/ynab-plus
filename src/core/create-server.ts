import { cwd } from "node:process";
import type { IEventBus, ILogger, ISessionData } from "@types";
import type { CommandHandler } from "./command-handler.ts";
import { ServerWebsocketClient } from "./websocket-client.ts";
import type { Server } from "bun";
import { FlatFileStorage } from "./flat-file-storage.ts";
import { join } from "node:path";
import { SessionStorage } from "./session-storage.ts";
import index from "./index.html";

export const createServer = (
  handlers: CommandHandler<keyof Commands>[],
  eventBus: IEventBus,
  developmentMode?: boolean,
) => {
  return Bun.serve({
    port: 3015,
    development: developmentMode ?? false,
    routes: {
      "/": index,
      "/socket": (
        request,
        server: Server<{ client: ServerWebsocketClient }>,
      ) => {
        const fileSessionStorage = new FlatFileStorage(
          join(cwd(), ".sessions"),
        );

        const sessions = new SessionStorage<ISessionData>(
          "user-id",
          request,
          fileSessionStorage,
        );

        if (
          server.upgrade(request, {
            data: {
              client: new ServerWebsocketClient(
                handlers,
                eventBus.child(sessions.getSessionId()),
                sessions,
              ),
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
};
