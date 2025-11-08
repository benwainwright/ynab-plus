export interface IEventPacket<TKey extends keyof Events> {
  key: TKey;
  data: Events[TKey];
}

export type IListener = (arg: IEventPacket<keyof Events>) => void;

export interface IEventEmitter {
  emit<TKey extends keyof Events>(key: TKey, data: Events[TKey]): void;

  [Symbol.dispose](): void;

  removeAll(): void;
}
