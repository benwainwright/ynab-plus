import type { IBootstrapper, ILogger } from "@ynab-plus/bootstrap";
import z from "zod";

import { AppServer } from "./app-server.ts";
import type { IApplicationLayer } from "@ynab-plus/app";

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
  // eslint-disable-next-line @typescript-eslint/require-await
}: WebAppDependencies) => {
  logger.info(`Composing web application`, LOG_CONTEXT);
  const server = new AppServer(
    application.withRequestScopedServiceBus(),
    bootstrapper.configValue("websocketPort", z.number()),
    bootstrapper.configValue("websocketHost", z.string()),
    logger,
  );

  bootstrapper.addInitStep(async () => {
    logger.info(`Starting websocket server`, LOG_CONTEXT);
    await server.start();
    logger.info(`Websocket server started`, LOG_CONTEXT);
  });
};
