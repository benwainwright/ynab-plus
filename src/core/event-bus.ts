import type { EventEmitter } from "node:events";

import { type IEventBus, type IEventPacket, type IListener } from "@types";

export class EventBus implements IEventBus {
  private listenerMap = new Map<string, IListener>();
  private children: IEventBus[] = [];
  public constructor(
    private listener: EventEmitter,
    private namespace: string,
  ) {}

  public child(namespace: string): IEventBus {
    const child = new EventBus(this.listener, `${this.namespace}-${namespace}`);
    this.children.push(child);
    return child;
  }

  public onAll(listener: IListener) {
    const listenerId = Bun.randomUUIDv7();
    this.listener.on(this.namespace, listener);
    this.listenerMap.set(listenerId, listener);
    return listenerId;
  }

  public off(identifier: string): void {
    const listenerToremove = this.listenerMap.get(identifier);
    if (listenerToremove) {
      this.listener.off(this.namespace, listenerToremove);
    }
  }

  public removeAll(): void {
    for (const [key] of this.listenerMap) {
      this.off(key);
    }
  }

  [Symbol.dispose](): void {
    this.removeAll();
  }

  public on<TKey extends keyof Events>(
    key: TKey,
    callback: (data: Events[TKey]) => void,
  ): string {
    const handler = (packet: {
      key: keyof Events;
      data: Events[keyof Events];
    }) => {
      const hasKey = <K extends keyof Events>(
        p: IEventPacket<keyof Events>,
        key: K,
      ): p is IEventPacket<K> => {
        return p.key === key;
      };

      if (hasKey(packet, key)) {
        callback(packet.data);
      }
    };

    return this.onAll(handler);
  }

  public emit<TKey extends keyof Events>(key: TKey, data: Events[TKey]) {
    this.listener.emit(this.namespace, { key, data });
    this.children.forEach((child) => child.emit(key, data));
  }
}
