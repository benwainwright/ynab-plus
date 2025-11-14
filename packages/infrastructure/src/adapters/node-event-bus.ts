import type { EventEmitter } from "node:events";

import type {
  IEventBus,
  IEventPacket,
  IListener,
  IUUIDGenerator,
} from "@ynab-plus/app";
import { type Events } from "@ynab-plus/domain";

export class NodeEventBus implements IEventBus {
  private listenerMap = new Map<string, IListener>();
  private children: IEventBus[] = [];
  public constructor(
    private listener: EventEmitter,
    private namespace: string,
    private uuidGenerator: IUUIDGenerator,
  ) {}

  public child(namespace: string): IEventBus {
    const child = new NodeEventBus(
      this.listener,
      `${this.namespace}-${namespace}`,
      this.uuidGenerator,
    );

    this.children.push(child);
    return child;
  }

  public onAll(listener: IListener) {
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

  public on<TKey extends keyof Events>(
    key: TKey,
    callback: (data: IEventPacket<TKey>["data"]) => void,
  ): string {
    const handler: IListener = (packet) => {
      if (packet.key === key) {
        callback(packet.data);
      }
    };

    return this.onAll(handler);
  }

  public emit<TKey extends keyof Events>(key: TKey, data: Events[TKey]) {
    this.listener.emit(this.namespace, { key, data });
    this.children.forEach((child) => { child.emit(key, data); });
  }
}
