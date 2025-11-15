import type { Commands, ICommandMessage, User } from "@ynab-plus/domain";

import type { IEventBus } from "./i-event-bus.ts";
import type { ISingleItemStore } from "./i-single-item-store.ts";

export interface IHandleContext<TKey extends keyof Commands> {
  command: ICommandMessage<TKey>;
  eventBus: IEventBus;
  currentUserCache: ISingleItemStore<User>;
}
