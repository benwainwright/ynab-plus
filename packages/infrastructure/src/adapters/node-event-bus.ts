import type { EventEmitter } from "node:events";

import type {
  IEventBus,
  IEventPacket,
  IListener,
  IUUIDGenerator,
} from "@ynab-plus/app";
import { serialiseObject } from "@ynab-plus/domain";

export class NodeEventBus<TEvent> implements IEventBus<TEvent> {
  private listenerMap = new Map<string, IListener<TEvent>>();
  private children: IEventBus<TEvent>[] = [];
  public constructor(
    private listener: EventEmitter,
    private namespace: string,
    private uuidGenerator: IUUIDGenerator,
  ) {}

  public child(namespace: string): IEventBus<TEvent> {
    const child = new NodeEventBus<TEvent>(
      this.listener,
      `${this.namespace}-${namespace}`,
      this.uuidGenerator,
    );

    this.children.push(child);
    return child;
  }

  public onAll(listener: IListener<TEvent>) {
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

  public on<TKey extends keyof TEvent>(
    key: TKey,
    callback: (data: IEventPacket<TEvent, TKey>["data"]) => void,
  ): string {
    const handler: IListener<TEvent> = (packet) => {
      if (packet.key === key) {
        callback(packet.data);
      }
    };

    return this.onAll(handler);
  }

  public emit<TKey extends keyof TEvent>(key: TKey, data: TEvent[TKey]) {
    this.listener.emit(this.namespace, { key, data: serialiseObject(data) });
    this.children.forEach((child) => {
      child.emit(key, data);
    });
  }
}
