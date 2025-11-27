import type { User } from "@ynab-plus/domain";
import type { IEventBus } from "../i-event-bus.ts";
import type { IServiceBus } from "../i-service-bus.ts";
import type { ISingleItemStore } from "../i-single-item-store.ts";
import type { Factory } from "inversify";
import type { TypedContainer } from "@inversifyjs/strongly-typed";
import type { ISessionIdRequester } from "../i-session-id-requester.ts";

export interface IEntrypointPorts {
  ContainerFactory: Factory<TypedContainer>;
  SessionStore: ISingleItemStore<User>;
  SessionIdRequester: ISessionIdRequester;
  ServiceBus: IServiceBus;
  EventBus: IEventBus;
}
