import type { IDomainEventBuffer, IRepository } from "@ynab-plus/app";
import type { ConfigValue } from "@ynab-plus/bootstrap";
import { SyncDetails } from "@ynab-plus/domain";
import { SqliteDatabase } from "./sqlite-database.ts";

import { injectable } from "inversify";
import { inject } from "@core";

interface RawSyncDetails {
  id: string;
  provider: string;
  checkpoint: string | undefined;
  lastSync: Date | undefined;
}

@injectable()
export class SqliteSyncDetailsRepository implements IRepository<SyncDetails> {
  public constructor(
    @inject("SyncDetailsTableName")
    private tableName: ConfigValue<string>,

    @inject("SqliteDatabase")
    private database: SqliteDatabase,

    @inject("DomainEventBuffer")
    private eventBuffer: IDomainEventBuffer,
  ) {}

  public async delete(syncDetails: SyncDetails): Promise<void> {
    this.eventBuffer.stageEvents(syncDetails);
    await this.database.runQuery(
      `DELETE FROM ${await this.tableName.value}
      WHERE id = ?`,
      [syncDetails.id],
    );
  }

  public async create() {
    await this.database.runQuery(
      `CREATE TABLE IF NOT EXISTS ${await this.tableName.value} (
          id TEXT PRIMARY KEY,
          provider TEXT NOT NULL,
          checkpoint TEXT,
          lastSync TEXT
      );`,
      [],
    );
  }

  private mapRaw(account: RawSyncDetails): SyncDetails {
    return SyncDetails.reconstitute({
      ...account,
      checkpoint: account.checkpoint ?? undefined,
      lastSync: account.lastSync ?? undefined,
    });
  }

  public async get(id: string): Promise<SyncDetails | undefined> {
    const result = await this.database.getFromDb<RawSyncDetails | undefined>(
      `SELECT id, provider, checkpoint, lastSync
        FROM ${await this.tableName.value}
        where id = ?`,
      [id],
    );

    if (!result) {
      return undefined;
    }

    return this.mapRaw(result);
  }

  public async save(thing: SyncDetails): Promise<SyncDetails> {
    this.eventBuffer.stageEvents(thing);
    await this.database.deferQueryToTransaction(
      `INSERT INTO ${await this.tableName.value} (id, provider, checkpoint, lastSync)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          provider = excluded.provider,
          checkpoint = excluded.checkpoint,
          lastSync = excluded.lastSync
        RETURNING id, provider, checkpoint, lastSync`,
      [thing.id, thing.provider, thing.checkpoint, thing.lastSync?.toISOString() ?? null],
    );

    return thing;
  }
}
