import z from "zod";

import type { ServiceBusFactory } from "@ynab-plus/app";
import type { IBootstrapper, ILogger } from "@ynab-plus/bootstrap";

import { AppServer } from "./app-server.ts";

interface WebAppDependencies {
  serviceBusFactory: ServiceBusFactory;
  configurator: IBootstrapper;
  logger: ILogger;
}

export const composeWebApp = async ({
  serviceBusFactory,
  configurator,
  logger,
}: WebAppDependencies) => {
  const server = new AppServer(
    serviceBusFactory,
    configurator.configValue("websocketPort", z.number()),
    configurator.configValue("websocketHost", z.string()),
    logger,
  );

  configurator.addInitStep(async () => {
    await server.start();
  });
};
