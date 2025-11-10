import type { IEventBus, ServiceBusFactory } from "@application";

import indexPage from "./client/index.html";
import { AppServer } from "./backend/app-server.ts";
import type { IConfigurator } from "../i-configurator.ts";

interface WebAppDependencies {
  serviceBusFactory: ServiceBusFactory;
  eventBus: IEventBus;
  configurator: IConfigurator;
}

export const composeWebApp = async ({
  serviceBusFactory,
  eventBus: bus,
  configurator,
}: WebAppDependencies) => {
  const server = new AppServer(serviceBusFactory, bus, indexPage);
  await server.configure(configurator);
  return server;
};
