import type { IEventBus } from "./i-event-bus.ts";
import type { IServiceBus } from "./i-service-bus.ts";

export type SingletonServiceBusFactory = () => Promise<{
  serviceBus: IServiceBus;
  eventBus: IEventBus;
}>;
