import type { IEventBus, IServiceBus, RequestScopedServiceBusFactory } from "@ports";

export interface IApplicationLayer {
  withRequestScopedServiceBus: () => RequestScopedServiceBusFactory;
  withSingletonServiceBus: () => Promise<{
    serviceBus: IServiceBus;
    eventBus: IEventBus;
  }>;
}
