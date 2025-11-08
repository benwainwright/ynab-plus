import type { ICommandMessage } from "./i-command-message.ts";
import type { IEventBus } from "./i-event-bus.ts";
import type { ISessionData } from "./i-session-data.ts";
import type { IStore } from "./i-store.ts";

export interface IHandleContext<TKey extends keyof Commands> {
  command: ICommandMessage<TKey>;
  eventBus: IEventBus;
  session: IStore<ISessionData>;
}
