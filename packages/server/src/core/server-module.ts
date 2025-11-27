import { AppServer, ServerWebsocketClient } from "@websocket-server";

import z from "zod";

import { TaskScheduler } from "@task-scheduler";
import { typedApplicationModule } from "@ynab-plus/bootstrap";
import type { IInternalTypes } from "./i-internal-types.ts";

const LOG_CONTEXT = { context: "server-module" };

export const serverModule = typedApplicationModule<IInternalTypes>(
  ({ load, logger, bootstrapper, container }) => {
    logger.info(`Initialising server module`, LOG_CONTEXT);

    load.bind("ServerWebsocketClient").to(ServerWebsocketClient);
    load.bind("AppServer").to(AppServer);
    load.bind("TaskRunner").to(TaskScheduler);

    bootstrapper.addInitStep(async () => {
      const server = await container.getAsync("AppServer");
      logger.info(`Starting websocket server`, LOG_CONTEXT);
      await server.start();
    });

    bootstrapper.addInitStep(async () => {
      const scheduler = await container.getAsync("TaskRunner");
      logger.info(`Starting task scheduler`, LOG_CONTEXT);
      await scheduler.start();
    });

    load
      .bind("WebsocketServerHost")
      .toConstantValue(bootstrapper.configValue("websocketHost", z.string()));

    load
      .bind("WebsocketServerPort")
      .toConstantValue(bootstrapper.configValue("websocketPort", z.number()));

    logger.debug(`Finished initialising server module`, LOG_CONTEXT);
  },
);
