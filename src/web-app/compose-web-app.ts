import type { IEventBus, ServiceBusFactory } from "@application";

import indexPage from "./client/index.html";
import { AppServer } from "./backend/app-server.ts";
import type { IBootstrapper } from "../i-bootstrapper.ts";
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
    indexPage,
    configurator.configValue("developmentMode", z.boolean()),
    configurator.configValue("port", z.number()),
  );

  configurator.addInitStep(async () => {
    const bunServer = await server.start();
    console.log(`Application server now running at ${bunServer.url}`);
  });
};
