import type { DomainEvents } from "./domain-event.ts";
import type { IEvent } from "./i-event.ts";

export abstract class DomainModel {
  private events: IEvent<DomainEvents, keyof DomainEvents>[] = [];

  public pullEvents(): IEvent<DomainEvents, keyof DomainEvents>[] {
    const events = this.events;
    this.events = [];
    return events;
  }

  protected raiseEvent<TKey extends keyof DomainEvents>(
    event: IEvent<DomainEvents, TKey>,
  ) {
    this.events.push(event);
  }
}
