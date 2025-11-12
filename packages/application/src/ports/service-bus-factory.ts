import type { IServiceBus } from "./i-service-bus.ts";
import type { ISessionIdRequester } from "./i-session-id-requester.ts";

export type ServiceBusFactory = (requestDetails: {
  sessionIdRequester: ISessionIdRequester;
}) => Promise<IServiceBus>;
