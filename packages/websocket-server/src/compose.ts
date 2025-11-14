import type { ServiceBusFactory } from "@ynab-plus/app";
import type { IBootstrapper, ILogger } from "@ynab-plus/bootstrap";
import z from "zod";

import { AppServer } from "./app-server.ts";

interface WebAppDependencies {
  serviceBusFactory: ServiceBusFactory;
  configurator: IBootstrapper;
  logger: ILogger;
}

export const LOG_CONTEXT = { context: "web-app" };

export const composeWebApp = async ({
  serviceBusFactory,
  configurator,
  logger,
}: WebAppDependencies) => {
  logger.info(`Composing web application`, LOG_CONTEXT);
  const server = new AppServer(
    serviceBusFactory,
    configurator.configValue("websocketPort", z.number()),
    configurator.configValue("websocketHost", z.string()),
    logger,
  );

  configurator.addInitStep(async () => {
    logger.info(`Starting websocket server`, LOG_CONTEXT);
    server.start();
    logger.info(`Websocket server started`, LOG_CONTEXT);
  });
};
