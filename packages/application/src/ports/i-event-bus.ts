import type { AllEvents } from "@core";
import type { IEventEmitter } from "./i-event-emitter.ts";
import type { IEventListener } from "./i-event-listener.ts";
import type { ServiceIdentifier } from "inversify";

export type IEventBus<TEvents = AllEvents> = IEventListener<TEvents> &
  IEventEmitter<TEvents> & {
    child: (namespace: string) => IEventBus<TEvents>;
  };

export const EventBusToken: ServiceIdentifier<IEventBus> =
  Symbol.for("EventBus");
