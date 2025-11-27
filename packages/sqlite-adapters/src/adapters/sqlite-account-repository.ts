import type { IAccountRepository } from "@ynab-plus/app";
import type { ConfigValue } from "@ynab-plus/bootstrap";
import { Account } from "@ynab-plus/domain";

import { SqliteDatabase } from "./sqlite-database.ts";
import { injectable } from "inversify";
import { $inject } from "@core";

interface RawAccount {
  id: string;
  userId: string;
  name: string;
  type: string;
  closed: string;
  note?: string | null;
  deleted: string;
}

@injectable()
export class Sqlite3AccountRepository implements IAccountRepository {
  public constructor(
    @$inject("AccountsTableName")
    private tableName: ConfigValue<string>,

    @$inject("SqliteDatabase")
    private database: SqliteDatabase,
  ) {}

  public async deleteAccount(account: Account): Promise<void> {
    await this.database.runQuery(
      `DELETE FROM ${await this.tableName.value}
      WHERE id = ?`,
      [account.id],
    );
  }

  async getAccounts(id: string): Promise<Account | undefined> {
    const result = await this.database.getFromDb<RawAccount | undefined>(
      `SELECT id, userId, name, type, closed, note, deleted
        FROM ${await this.tableName.value}
        where id = ?`,
      [id],
    );

    if (!result) {
      return undefined;
    }

    return this.mapRaw(result);
  }

  private mapRaw(account: RawAccount): Account {
    return Account.reconstitute({
      ...account,
      closed: account.closed === "closed",
      deleted: account.deleted === "deleted",
      note: account.note ?? undefined,
    });
  }

  async getUserAccounts(userId: string): Promise<Account[]> {
    const result = await this.database.getAllFromDatabase<RawAccount[]>(
      `SELECT id, userId, name, type, closed, note, deleted
        FROM ${await this.tableName.value}
        WHERE userId = ?
        `,
      [userId],
    );

    return result.map((account) => this.mapRaw(account));
  }

  public async create() {
    await this.database.runQuery(
      `CREATE TABLE IF NOT EXISTS ${await this.tableName.value} (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          closed TEXT NOT NULL,
          note TEXT,
          deleted TEXT NOT NULL
      );`,
      [],
    );
  }

  public async saveAccount(thing: Account): Promise<Account> {
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

    return this.mapRaw(data);
  }

  public async saveAccounts(accounts: Account[]): Promise<Account[]> {
    await this.database.runQuery("BEGIN;", []);

    const returnVal: Account[] = [];

    try {
      for (const account of accounts) {
        returnVal.push(await this.saveAccount(account));
      }

      await this.database.runQuery("COMMIT;", []);

      return returnVal;
    } catch (err) {
      await this.database.runQuery("ROLLBACK;", []);
      throw err;
    }
  }
}
