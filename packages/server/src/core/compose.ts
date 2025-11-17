import type { IBootstrapper, ILogger } from "@ynab-plus/bootstrap";
import z from "zod";

import { AppServer } from "@websocket-server";
import type { IApplicationLayer } from "@ynab-plus/app";
import { TaskScheduler } from "@task-scheduler";

interface WebAppDependencies {
  application: IApplicationLayer;
  bootstrapper: IBootstrapper;
  logger: ILogger;
}

export const LOG_CONTEXT = { context: "web-app" };

export const composeWebApp = async ({
  application,
  bootstrapper,
  logger,
}: WebAppDependencies) => {
  logger.info(`Composing web application`, LOG_CONTEXT);

  const server = new AppServer(
    application.withRequestScopedServiceBus(),
    bootstrapper.configValue("websocketPort", z.number()),
    bootstrapper.configValue("websocketHost", z.string()),
    logger,
  );
  const { serviceBus, eventBus } = await application.withSingletonServiceBus();

  const taskScheduler = new TaskScheduler(serviceBus, eventBus, logger);

  bootstrapper.addInitStep(async () => {
    logger.info(`Starting task scheduler`, LOG_CONTEXT);
    await taskScheduler.initialise();
    logger.info(`Task scheduler started`, LOG_CONTEXT);
  });

  bootstrapper.addInitStep(async () => {
    logger.info(`Starting websocket server`, LOG_CONTEXT);
    await server.start();
    logger.info(`Websocket server started`, LOG_CONTEXT);
  });
};
