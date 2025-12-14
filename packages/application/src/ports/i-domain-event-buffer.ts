import type { DomainModel } from "@ynab-plus/domain";

export interface IDomainEventBuffer {
  stageEvents: (entity: DomainModel) => void;
}
