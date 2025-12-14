export interface IDomainEventStore {
  flush: () => void;
  purge: () => void;
}
