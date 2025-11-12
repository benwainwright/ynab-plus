import type { IEventBus, ServiceBusFactory } from "@ynab-plus/app";

import { AppServer } from "./app-server.ts";
import type { IBootstrapper } from "@ynab-plus/bootstrap";
import z from "zod";

interface WebAppDependencies {
  serviceBusFactory: ServiceBusFactory;
  eventBus: IEventBus;
  configurator: IBootstrapper;
}

export const composeWebApp = async ({
  serviceBusFactory,
  eventBus: bus,
  configurator,
}: WebAppDependencies) => {
  const server = new AppServer(
    serviceBusFactory,
    bus,
    configurator.configValue("websocketPort", z.number()),
  );

  configurator.addInitStep(async () => {
    const bunServer = await server.start();
    console.log(`Application server now running`);
  });
};
