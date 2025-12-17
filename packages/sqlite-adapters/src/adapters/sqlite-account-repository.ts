import type { IAccountRepository, IDomainEventBuffer } from "@ynab-plus/app";
import type { ConfigValue } from "@ynab-plus/bootstrap";
import { Account } from "@ynab-plus/domain";

import { SqliteDatabase } from "./sqlite-database.ts";
import { injectable } from "inversify";
import { inject } from "@core";

interface RawAccount {
  id: string;
  userId: string;
  name: string;
  type: string;
  closed: string;
  note?: string | null;
  balance: number;
  clearedBalance: number;
  unclearedBalance: number;
  linkedOpenBankingAccount: string | null;
  deleted: string;
}

@injectable()
export class Sqlite3AccountRepository implements IAccountRepository {
  public constructor(
    @inject("AccountsTableName")
    private tableName: ConfigValue<string>,

    @inject("SqliteDatabase")
    private database: SqliteDatabase,

    @inject("DomainEventBuffer")
    private domainEventStore: IDomainEventBuffer
  ) {}

  public async deleteAccount(account: Account): Promise<void> {
    this.domainEventStore.stageEvents(account);
    await this.database.deferQueryToTransaction(
      `DELETE FROM ${await this.tableName.value}
      WHERE id = ?`,
      [account.id]
    );
  }

  async getAccount(id: string): Promise<Account | undefined> {
    const result = await this.database.getFromDb<RawAccount | undefined>(
      `SELECT id, userId, name, type, closed, note, deleted, balance, clearedBalance, unclearedBalance, linkedOpenBankingAccount
        FROM ${await this.tableName.value}
        where id = ?`,
      [id]
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
      linkedOpenBankingAccount: account.linkedOpenBankingAccount ?? undefined
    });
  }

  async getUserAccounts(userId: string): Promise<Account[]> {
    const result = await this.database.getAllFromDatabase<RawAccount[]>(
      `SELECT id, userId, name, type, closed, note, deleted, balance, clearedBalance, unclearedBalance, linkedOpenBankingAccount
        FROM ${await this.tableName.value}
        WHERE userId = ?
        `,
      [userId]
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
          balance INTEGER NOT NULL,
          clearedBalance INTEGER NOT NULL,
          unclearedBalance INTEGER NOT NULL,
          note TEXT,
          deleted TEXT NOT NULL,
          linkedOpenBankingAccount TEXT
      );`,
      []
    );
  }

  public async saveAccount(thing: Account): Promise<Account> {
    this.domainEventStore.stageEvents(thing);
    await this.database.deferQueryToTransaction(
      `INSERT INTO ${await this.tableName.value} (id, userId, name, type, closed, note, deleted, balance, clearedBalance, unclearedBalance, linkedOpenBankingAccount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          userId = excluded.userId,
          name = excluded.name,
          type = excluded.type,
          closed = excluded.closed,
          note = excluded.note,
          deleted = excluded.deleted,
          balance = excluded.balance,
          clearedBalance = excluded.clearedBalance,
          unclearedBalance = excluded.unclearedBalance,
          linkedOpenBankingAccount = excluded.linkedOpenBankingAccount`,
      [
        thing.id,
        thing.userId,
        thing.name,
        thing.type,
        thing.closed ? "closed" : "open",
        thing.note,
        thing.deleted ? "deleted" : "not_deleted",
        thing.balance,
        thing.clearedBalance,
        thing.unclearedBalance,
        thing.linkedOpenBankingAccount
      ]
    );

    return thing;
  }

  public async saveAccounts(accounts: Account[]): Promise<Account[]> {
    for (const account of accounts) {
      await this.saveAccount(account);
    }

    return accounts;
  }
}
