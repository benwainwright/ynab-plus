import { cwd } from "node:process";
import { join } from "node:path";

import type { Server } from "bun";
import type { IEventBus, ISessionData } from "@types";

import type { CommandHandler } from "./command-handler.ts";
import { ServerWebsocketClient } from "./websocket-client.ts";
import { FlatFileStorage } from "./flat-file-storage.ts";
import { SessionStorage } from "./session-storage.ts";

interface ServerConfig {
  handlers: CommandHandler<keyof Commands>[];
  eventBus: IEventBus;
  developmentMode?: boolean;
  indexPage: Bun.HTMLBundle;
}

export const createServer = ({
  handlers,
  eventBus,
  indexPage,
  developmentMode,
}: ServerConfig) => {
  return Bun.serve({
    port: 3015,
    development: developmentMode ?? false,
    routes: {
      "/": indexPage,
      "/*": () =>
        Response.json({}, { status: 301, headers: { location: "/" } }),
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
