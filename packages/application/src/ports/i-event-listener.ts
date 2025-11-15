import type { Events } from "@ynab-plus/domain";

export type IEventPacket<
  TEvents = Events,
  TKey extends keyof TEvents = keyof TEvents,
> = TKey extends keyof Events
  ? {
      key: TKey;
      data: Events[TKey];
    }
  : never;

export type IListener<TEvents = Events> = (
  arg: IEventPacket<TEvents, keyof TEvents>,
) => void;

export interface IEventListener<TEvents> {
  off(identifier: string): void;

  onAll(callback: IListener<TEvents>): string;

  on<TKey extends keyof TEvents>(
    key: TKey,
    callback: (data: IEventPacket<TEvents, TKey>["data"]) => void,
  ): string;

  [Symbol.dispose](): void;

  removeAll(): void;
}
