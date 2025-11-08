export interface IEventPacket<TKey extends keyof Events> {
  key: TKey;
  data: Events[TKey];
}

export type IListener = (arg: IEventPacket<keyof Events>) => void;

export interface IEventListener {
  off(identifier: string): void;

  onAll(callback: IListener): string;

  on<TKey extends keyof Events>(
    key: TKey,
    callback: (data: Events[TKey]) => void,
  ): string;

  [Symbol.dispose](): void;

  removeAll(): void;
}
