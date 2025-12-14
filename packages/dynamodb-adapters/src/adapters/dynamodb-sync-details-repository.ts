import type { IDomainEventBuffer, IRepository } from "@ynab-plus/app";
import { SyncDetails } from "@ynab-plus/domain";
import { injectable } from "inversify";
import type { DyanamoDbSingleTableClient } from "../core/dynamodb-single-table-client.ts";
import { inject, Schema } from "@core";
import { Model, type Entity } from "dynamodb-onetable";

@injectable()
export class DynamoDbSyncDetailsRepository implements IRepository<SyncDetails> {
  public constructor(
    @inject("SingleTableClient")
    private readonly tableClient: DyanamoDbSingleTableClient,

    @inject("DomainEventBuffer")
    private eventBuffer: IDomainEventBuffer,
  ) {}

  public async get(id: string): Promise<SyncDetails | undefined> {
    const table = await this.tableClient.getTable();

    type SyncDetailsSchema = Entity<typeof Schema.models.SyncDetails>;
    const SyncDetailsModel: Model<SyncDetailsSchema> = table.getModel("SyncDetails");

    const result = await SyncDetailsModel.get({ id });

    if (!result) {
      return result;
    }

    return SyncDetails.reconstitute({
      id: result.id,
      provider: result.provider,
      checkpoint: result.checkpoint,
      lastSync: result.lastSync,
    });
  }

  public async save(thing: SyncDetails): Promise<SyncDetails> {
    this.eventBuffer.stageEvents(thing);
    const table = await this.tableClient.getTable();

    type SyncDetailsSchema = Entity<typeof Schema.models.SyncDetails>;
    const SyncDetailsModel: Model<SyncDetailsSchema> = table.getModel("SyncDetails");

    await SyncDetailsModel.create(
      {
        id: thing.id,
        ...(thing.checkpoint ? { checkpoint: thing.checkpoint } : {}),
        ...(thing.lastSync ? { lastSync: thing.lastSync } : {}),
        provider: thing.provider,
      },
      { transaction: this.tableClient.transaction },
    );

    return thing;
  }

  public async delete(thing: SyncDetails): Promise<void> {
    this.eventBuffer.stageEvents(thing);
    const table = await this.tableClient.getTable();

    type SyncDetailsSchema = Entity<typeof Schema.models.SyncDetails>;
    const SyncDetailsModel: Model<SyncDetailsSchema> = table.getModel("SyncDetails");

    await SyncDetailsModel.remove({ id: thing.id }, { transaction: this.tableClient.transaction });
  }

  public async create(): Promise<void> {}
}
