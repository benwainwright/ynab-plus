import type { ITransactionRepository } from "@ynab-plus/app";
import { Transaction, transactionSchema } from "@ynab-plus/domain";
import type { SqliteDatabase } from "./sqlite-database.ts";
import type { ConfigValue } from "@ynab-plus/bootstrap";

interface RawTransaction {
  id: string;
  accountId: string;
  date: string;
  amount: number;
  cleared: string;
  memo: string | undefined;
  approved: string;
}

export class SqliteTransactionRepository implements ITransactionRepository {
  public constructor(
    private tableName: ConfigValue<string>,
    private database: SqliteDatabase,
  ) {}

  public mapRaw(raw: RawTransaction): Transaction {
    const object = transactionSchema.parse({
      ...raw,
      cleared: raw.cleared === "true",
      memo: raw.memo ?? undefined,
      approved: raw.approved === "true",
    });

    return new Transaction(object);
  }

  public async create() {
    await this.database.runQuery(
      `CREATE TABLE IF NOT EXISTS ${await this.tableName.value} (
          id TEXT PRIMARY KEY,
          accountId TEXT NOT NULL,
          date TEXT NOT NULL,
          amount INTEGER NOT NULL,
          cleared TEXT NOT NULL,
          memo TEXT,
          approved TEXT NOT NULL
      );`,
      [],
    );
  }

  public async getTransaction(id: string): Promise<Transaction | undefined> {
    const result = await this.database.getFromDb<RawTransaction | undefined>(
      `SELECT id, accountId, date, amount, cleared, memo, approved
        FROM ${await this.tableName.value}
        where id = ?`,
      [id],
    );

    if (!result) {
      return undefined;
    }

    return this.mapRaw(result);
  }

  public async saveTransaction(transaction: Transaction): Promise<Transaction> {
    const data = await this.database.getFromDb<RawTransaction>(
      `INSERT INTO ${await this.tableName.value} (id, accountId, date, amount, cleared, memo, approved)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          accountId = excluded.accountId,
          date = excluded.date,
          amount = excluded.amount,
          cleared = excluded.cleared,
          memo = excluded.memo,
          approved = excluded.approved
        RETURNING id, accountId, date, amount, cleared, memo, approved`,
      [
        transaction.id,
        transaction.accountId,
        transaction.date.toISOString(),
        transaction.amount,
        String(transaction.cleared),
        transaction.memo ?? null,
        String(transaction.approved),
      ],
    );

    return this.mapRaw(data);
  }

  public async getAccountTransactions(
    accountId: string,
    limit: number,
    offset: number,
  ): Promise<Transaction[]> {
    const result = await this.database.getAllFromDatabase<RawTransaction[]>(
      `SELECT id, accountId, date, amount, cleared, memo, approved
        FROM ${await this.tableName.value}
        WHERE accountId = ?
        LIMIT ? OFFSET ?`,
      [accountId, limit, offset],
    );

    return result.map((account) => this.mapRaw(account));
  }

  public async saveTransactions(
    transactions: Transaction[],
  ): Promise<Transaction[]> {
    await this.database.runQuery("BEGIN;", []);
    const returnVal: Transaction[] = [];

    try {
      for (const transaction of transactions) {
        returnVal.push(await this.saveTransaction(transaction));
      }

      await this.database.runQuery("COMMIT;", []);

      return returnVal;
    } catch (err) {
      await this.database.runQuery("ROLLBACK;", []);
      throw err;
    }
  }
}
