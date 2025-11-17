import type { User } from "@ynab-plus/domain";
import type { IEventBus } from "./i-event-bus.ts";
import type { IServiceBus } from "./i-service-bus.ts";
import type { ISessionIdRequester } from "./i-session-id-requester.ts";
import type { ISingleItemStore } from "./i-single-item-store.ts";

export type RequestScopedServiceBusFactory = (requestDetails: {
  sessionIdRequester: ISessionIdRequester;
}) => Promise<{
  serviceBus: IServiceBus;
  eventBus: IEventBus;
  currentUserCache: ISingleItemStore<User & { $type: "user" }>;
}>;
