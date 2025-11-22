import type { ITransactionRepository } from "@ynab-plus/app";
import { Transaction, transactionSchema } from "@ynab-plus/domain";
import type { SqliteDatabase } from "./sqlite-database.ts";
import type { ConfigValue } from "@ynab-plus/bootstrap";

interface RawTransaction {
  id: string;
  accountId: string;
  date: string;
  amount: number;
  cleared: "cleared" | "uncleared" | "reconciled";
  memo: string | undefined;
  approved: string;
}

export class SqliteTransactionRepository implements ITransactionRepository {
  public constructor(
    private tableName: ConfigValue<string>,
    private database: SqliteDatabase,
  ) {}

  public async getAccountTransactionCount(accountId: string): Promise<number> {
    const result = await this.database.getFromDb<{ count: number } | null>(
      `SELECT COUNT(*) as count
         FROM ${await this.tableName.value}
        WHERE accountId = ?`,
      [accountId],
    );

    return result?.count ?? 0;
  }

  public mapRaw(raw: RawTransaction): Transaction {
    const object = transactionSchema.parse({
      ...raw,
      memo: raw.memo ?? undefined,
      approved: raw.approved === "true",
    });

    return Transaction.reconstitute(object);
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
          payee TEXT NOT NULL,
          approved TEXT NOT NULL
      );`,
      [],
    );
  }

  public async getTransaction(id: string): Promise<Transaction | undefined> {
    const result = await this.database.getFromDb<RawTransaction | undefined>(
      `SELECT id, accountId, date, amount, cleared, memo, payee, approved
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
      `INSERT INTO ${await this.tableName.value} (id, accountId, date, amount, cleared, memo, payee, approved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          accountId = excluded.accountId,
          date = excluded.date,
          amount = excluded.amount,
          cleared = excluded.cleared,
          memo = excluded.memo,
          payee = excluded.payee,
          approved = excluded.approved
        RETURNING id, accountId, date, amount, cleared, memo, payee, approved`,
      [
        transaction.id,
        transaction.accountId,
        transaction.date.toISOString(),
        transaction.amount,
        transaction.cleared,
        transaction.memo ?? null,
        transaction.payee,
        String(transaction.approved),
      ],
    );

    return this.mapRaw(data);
  }

  public async getAccountTransactions(
    accountId: string,
    offset: number,
    limit: number,
  ): Promise<Transaction[]> {
    const result = await this.database.getAllFromDatabase<RawTransaction[]>(
      `SELECT id, accountId, date, amount, cleared, memo, payee, approved
        FROM ${await this.tableName.value}
        WHERE accountId = ?
        ORDER BY date DESC
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
