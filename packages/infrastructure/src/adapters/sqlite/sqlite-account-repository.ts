import type { IAccountRepository } from "@ynab-plus/app";
import type { ConfigValue } from "@ynab-plus/bootstrap";
import { Account } from "@ynab-plus/domain";

import type { SqliteDatabase } from "./sqlite-database.ts";

interface RawAccount {
  id: string;
  userId: string;
  name: string;
  type: string;
  closed: string;
  note: string;
  deleted: string;
}

export class Sqlite3AccountRepository implements IAccountRepository {
  public constructor(
    private tableName: ConfigValue<string>,
    private database: SqliteDatabase,
  ) {}

  async get(id: string): Promise<Account | undefined> {
    const result = await this.database.getFromDb<RawAccount | undefined>(
      `SELECT id, userId, name, type, closed, note, deleted
        FROM ${await this.tableName.value}
        where id = ?`,
      [id],
    );

    return result
      ? new Account({
          ...result,
          closed: result.closed === "closed",
          deleted: result.deleted === "deleted",
        })
      : undefined;
  }

  async getUserAccounts(userId: string): Promise<Account[]> {
    const result = await this.database.getAllFromDatabase<RawAccount[]>(
      `SELECT id, userId, name, type, closed, note, deleted
        FROM ${await this.tableName.value}
        WHERE userId = ?
        `,
      [userId],
    );

    return result.map(
      (result) =>
        new Account({
          ...result,
          closed: result.closed === "closed",
          deleted: result.deleted === "deleted",
        }),
    );
  }

  public async create() {
    await this.database.runQuery(
      `CREATE TABLE IF NOT EXISTS ${await this.tableName.value} (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          closed TEXT NOT NULL,
          note TEXT NOT NULL,
          deleted TEXT NOT NULL
      );`,
      [],
    );
  }

  public async save(thing: Account): Promise<Account> {
    const data = await this.database.getFromDb<RawAccount>(
      `INSERT INTO ${await this.tableName.value} (id, userId, name, type, closed, note, deleted)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          userId = excluded.userId,
          name = excluded.name,
          type = excluded.type,
          closed = excluded.closed,
          note = excluded.note,
          deleted = excluded.deleted
        RETURNING id, userId, name, type, closed, note, deleted`,
      [
        thing.id,
        thing.userId,
        thing.name,
        thing.type,
        thing.closed ? "closed" : "open",
        thing.note,
        thing.deleted ? "deleted" : "not_deleted",
      ],
    );
    return new Account({
      ...data,
      closed: data.closed === "closed",
      deleted: data.deleted === "deleted",
    });
  }
}
