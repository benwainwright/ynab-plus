import { AppServer } from "@websocket-server";
import {
  WebsocketServerHostConfigValueToken,
  WebsocketServerPortConfigValueToken,
} from "./websocket-server/app-server.ts";
import { applicationModule } from "@ynab-plus/bootstrap";

import z from "zod";

import { ServerWebsocketClient } from "./websocket-server/websocket-client.ts";
import { TaskScheduler } from "@task-scheduler";

const LOG_CONTEXT = { context: "server-module" };

export const serverModule = applicationModule(
  ({ load, logger, bootstrapper }) => {
    logger.info(`Initialising server module`, LOG_CONTEXT);
    load.bind(AppServer).toSelf();

    load.bind(ServerWebsocketClient).toSelf();
    load.bind(TaskScheduler).toSelf();

    bootstrapper.addEntryPoint(AppServer);
    bootstrapper.addEntryPoint(TaskScheduler);

    load
      .bind(WebsocketServerHostConfigValueToken)
      .toConstantValue(bootstrapper.configValue("websocketHost", z.string()));

    load
      .bind(WebsocketServerPortConfigValueToken)
      .toConstantValue(bootstrapper.configValue("websocketPort", z.number()));

    logger.debug(`Finished initialising server module`, LOG_CONTEXT);
  },
);
