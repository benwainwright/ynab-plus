import type { EventEmitter } from "node:events";

import type {
  IEventBus,
  IEventPacket,
  IListener,
  IUUIDGenerator,
} from "@ports";
import { type Events, serialiseObject } from "@ynab-plus/domain";

export class EventBus<TEvents = Events> implements IEventBus<TEvents> {
  private listenerMap = new Map<string, IListener<TEvents>>();
  private children: IEventBus<TEvents>[] = [];
  public constructor(
    private listener: EventEmitter,
    private namespace: string,
    private uuidGenerator: IUUIDGenerator,
  ) {}

  public child(namespace: string): IEventBus<TEvents> {
    const child = new EventBus<TEvents>(
      this.listener,
      `${this.namespace}-${namespace}`,
      this.uuidGenerator,
    );

    this.children.push(child);
    return child;
  }

  public onAll(listener: IListener<TEvents>) {
    const listenerId = this.uuidGenerator.getUUID();
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

  public on<TKey extends keyof TEvents>(
    key: TKey,
    callback: (data: IEventPacket<TEvents, TKey>["data"]) => void,
  ): string {
    const handler: IListener<TEvents> = (packet) => {
      if (packet.key === key) {
        callback(packet.data);
      }
    };

    return this.onAll(handler);
  }

  public emit<TKey extends keyof TEvents>(key: TKey, data: TEvents[TKey]) {
    this.listener.emit(this.namespace, { key, data: serialiseObject(data) });
    this.children.forEach((child) => {
      child.emit(key, data);
    });
  }
}
