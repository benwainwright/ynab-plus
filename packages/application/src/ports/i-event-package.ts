import type { Events } from "@ynab-plus/domain";

export type IEventPacket<TKey extends keyof Events = keyof Events> =
  TKey extends keyof Events
    ? {
        key: TKey;
        data: Events[TKey];
      }
    : never;

export type IListener = (arg: IEventPacket) => void;

export interface IEventListener {
  off(identifier: string): void;

  onAll(callback: IListener): string;

  on<TKey extends keyof Events>(
    key: TKey,
    callback: (data: IEventPacket<TKey>["data"]) => void,
  ): string;

  [Symbol.dispose](): void;

  removeAll(): void;
}
