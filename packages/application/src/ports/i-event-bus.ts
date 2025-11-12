import type { IEventEmitter } from "./i-event-emitter.ts";
import type { IEventListener } from "./i-event-listener.ts";

export type IEventBus = IEventListener &
  IEventEmitter & {
    child: (namespace: string) => IEventBus;
  };
