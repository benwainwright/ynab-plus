import type { IEventBus, ServiceBusFactory } from "@application";

import indexPage from "./client/index.html";
import { AppServer } from "./backend/app-server.ts";

interface WebAppDependencies {
  serviceBusFactory: ServiceBusFactory;
  eventBus: IEventBus;
  developmentMode: boolean;
}

export const composeWebApp = ({
  serviceBusFactory,
  eventBus: bus,
  developmentMode,
}: WebAppDependencies) => {
  return new AppServer(serviceBusFactory, bus, developmentMode, indexPage);
};
