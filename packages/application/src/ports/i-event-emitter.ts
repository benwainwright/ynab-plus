import type { Events } from "@ynab-plus/domain";

export interface IEventEmitter<TEvents = Events> {
  emit<TKey extends keyof TEvents>(key: TKey, data: TEvents[TKey]): void;

  [Symbol.dispose](): void;

  removeAll(): void;
}
