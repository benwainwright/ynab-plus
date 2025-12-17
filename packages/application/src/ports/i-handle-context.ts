import type { Command, Commands, IRole, User } from "@ynab-plus/domain";

import type { IEventBus } from "./i-event-bus.ts";

export interface IHandleContext<TKey extends keyof Commands, TRole extends IRole = User> {
  command: Command<TKey, TRole>;
  eventBus: IEventBus;
}
