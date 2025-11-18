import type { IRepository } from "@ynab-plus/app";
import type { ConfigValue } from "@ynab-plus/bootstrap";
import { SyncDetails, type ISyncDetails } from "@ynab-plus/domain";
import type { SqliteDatabase } from "./sqlite-database.ts";

interface RawSyncDetails {
  id: string;
  provider: string;
  checkpoint: string | undefined;
  lastSync: Date;
}

export class SqliteSyncDetailsRepository implements IRepository<ISyncDetails> {
  public constructor(
    private tableName: ConfigValue<string>,
    private database: SqliteDatabase,
  ) {}

  public async create() {
    await this.database.runQuery(
      `CREATE TABLE IF NOT EXISTS ${await this.tableName.value} (
          id TEXT PRIMARY KEY,
          provider TEXT NOT NULL,
          checkpoint TEXT,
          lastSync TEXT NOT NULL
      );`,
      [],
    );
  }

  private mapRaw(account: RawSyncDetails): SyncDetails {
    return SyncDetails.fromObject({
      ...account,
      checkpoint: account.checkpoint ?? undefined,
    });
  }

  public async get(id: string): Promise<ISyncDetails | undefined> {
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
    const data = await this.database.getFromDb<RawSyncDetails>(
      `INSERT INTO ${await this.tableName.value} (id, provider, checkpoint, lastSync)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          provider = excluded.provider,
          checkpoint = excluded.checkpoint,
          lastSync = excluded.lastSync
        RETURNING id, provider, checkpoint, lastSync`,
      [
        thing.id,
        thing.provider,
        thing.checkpoint,
        thing.lastSync.toISOString(),
      ],
    );

    return this.mapRaw(data);
  }
}
