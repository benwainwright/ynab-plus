import type { IDomainEventBuffer, IDomainEventStore, IEventBus } from "@ports";
import type { DomainEvents, DomainModel, IEvent } from "@ynab-plus/domain";
import { injectable } from "inversify";
import { inject } from "./typed-inject.ts";

@injectable()
export class DomainEventStore implements IDomainEventBuffer, IDomainEventStore {
  public constructor(
    @inject("EventBus")
    private readonly eventBus: IEventBus
  ) {}

  private events: IEvent<DomainEvents, keyof DomainEvents>[] = [];

  public stageEvents(entity: DomainModel): void {
    const events = entity.pullEvents();
    events.forEach((event) => {
      this.events.push(event);
    });
  }

  public flush() {
    this.events.forEach((event) => {
      this.eventBus.emit(event.event, event.data);
    });

    this.events = [];
  }

  public purge() {
    this.events = [];
  }
}
