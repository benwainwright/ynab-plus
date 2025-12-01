import type { DomainEvents, IEvent } from "@ynab-plus/domain";

export interface IUnitOfWork {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  registerEvent(event: IEvent<DomainEvents, keyof DomainEvents>): void;
  drainEvents(): IEvent<DomainEvents, keyof DomainEvents>[];
}
