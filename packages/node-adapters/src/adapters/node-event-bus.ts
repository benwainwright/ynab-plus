import type { EventEmitter } from "node:events";

import type { IEventBus, IEventPacket, IListener } from "@ynab-plus/app";
import { v7 } from "uuid";
import { inject, injectable, type ServiceIdentifier } from "inversify";

export const EventBusListenerToken: ServiceIdentifier<EventEmitter> =
  Symbol.for("EventBusListener");

export const EventBusNamespaceToken: ServiceIdentifier<string> =
  Symbol.for("NamespaceToken");

@injectable()
export class NodeEventBus<TEvent> implements IEventBus<TEvent> {
  private listenerMap = new Map<string, IListener<TEvent>>();
  private children: IEventBus<TEvent>[] = [];
  public constructor(
    @inject(EventBusListenerToken)
    private listener: EventEmitter,

    @inject(EventBusNamespaceToken)
    private namespace: string,
    private parent?: IEventBus<TEvent>,
  ) {}

  public child(namespace: string): IEventBus<TEvent> {
    const child = new NodeEventBus<TEvent>(
      this.listener,
      `${this.namespace}-${namespace}`,
      this,
    );

    this.children.push(child);
    return child;
  }

  public onAll(listener: IListener<TEvent>) {
    const listenerId = v7();

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
    this.listener.emit(this.namespace, { key, data });
    this.parent?.emit(key, data);
  }
}
