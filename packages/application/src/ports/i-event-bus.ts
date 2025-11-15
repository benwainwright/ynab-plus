import type { Events } from "@ynab-plus/domain";

import type { IEventEmitter } from "./i-event-emitter.ts";
import type { IEventListener } from "./i-event-listener.ts";

export type IEventBus<TEvents = Events> = IEventListener<TEvents> &
  IEventEmitter<TEvents> & {
    child: (namespace: string) => IEventBus<TEvents>;
  };
