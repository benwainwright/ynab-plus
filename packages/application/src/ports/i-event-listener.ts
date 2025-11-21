import type { AllEvents } from "@core";

export type IEventPacket<
  TEvents,
  TKey extends keyof TEvents = keyof TEvents,
> = TKey extends keyof AllEvents
  ? {
      key: TKey;
      data: AllEvents[TKey];
    }
  : never;

export type IListener<TEvents = AllEvents> = (
  arg: IEventPacket<TEvents, keyof TEvents>,
) => void;

export interface IEventListener<TEvents> {
  off(identifier: string): void;

  onAll(callback: IListener<TEvents>): string;

  on<TKey extends keyof TEvents>(
    key: TKey,
    callback: (
      data: IEventPacket<TEvents, TKey>["data"],
    ) => void | Promise<void>,
  ): string;

  [Symbol.dispose](): void;

  removeAll(): void;
}
