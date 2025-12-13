import { injectable } from "inversify";

import type { ConfigValue } from "@ynab-plus/bootstrap";
import type { ITransactionRepository } from "@ynab-plus/app";
import { Transaction, transactionSchema } from "@ynab-plus/domain";
import { inject } from "@core";
import { SqliteDatabase } from "./sqlite-database.ts";

interface RawTransaction {
  id: string;
  accountId: string;
  userId: string;
  date: string;
  amount: number;
  cleared: "cleared" | "uncleared" | "reconciled";
  memo: string | undefined;
  approved: string;
}

@injectable()
export class SqliteTransactionRepository implements ITransactionRepository {
  public constructor(
    @inject("TransactionsTableName")
    private tableName: ConfigValue<string>,
    @inject("SqliteDatabase")
    private database: SqliteDatabase,
  ) {}

  public async getAccountTransactionCount(userId: string, accountId: string): Promise<number> {
    const result = await this.database.getFromDb<{ count: number } | null>(
      `SELECT COUNT(*) as count
         FROM ${await this.tableName.value}
        WHERE accountId = ? and userId = ?`,
      [accountId, userId],
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
          id TEXT,
          userId TEXT,
          accountId TEXT NOT NULL,
          date TEXT NOT NULL,
          amount INTEGER NOT NULL,
          cleared TEXT NOT NULL,
          memo TEXT,
          payee TEXT NOT NULL,
          approved TEXT NOT NULL,
          PRIMARY KEY (id, userId)

      );`,
      [],
    );
  }

  public async getTransaction(id: string): Promise<Transaction | undefined> {
    const result = await this.database.getFromDb<RawTransaction | undefined>(
      `SELECT id, userId, accountId, date, amount, cleared, memo, payee, approved
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
    await this.database.deferQueryToTransaction(
      `INSERT INTO ${await this.tableName.value} (id, userId, accountId, date, amount, cleared, memo, payee, approved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id, userId) DO UPDATE SET
          accountId = excluded.accountId,
          date = excluded.date,
          amount = excluded.amount,
          cleared = excluded.cleared,
          memo = excluded.memo,
          payee = excluded.payee,
          approved = excluded.approved
        RETURNING id, userId, accountId, date, amount, cleared, memo, payee, approved`,
      [
        transaction.id,
        transaction.userId,
        transaction.accountId,
        transaction.date.toISOString(),
        transaction.amount,
        transaction.cleared,
        transaction.memo ?? null,
        transaction.payee,
        String(transaction.approved),
      ],
    );

    return transaction;
  }

  public async getAccountTransactions(
    userId: string,
    accountId: string,
    offset: number,
    limit: number,
  ): Promise<Transaction[]> {
    const result = await this.database.getAllFromDatabase<RawTransaction[]>(
      `SELECT id, userId, accountId, date, amount, cleared, memo, payee, approved
        FROM ${await this.tableName.value}
        WHERE accountId = ? AND userId = ?
        ORDER BY date DESC
        LIMIT ? OFFSET ?`,
      [accountId, userId, limit, offset],
    );

    return result.map((account) => this.mapRaw(account));
  }

  public async saveTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    for (const transaction of transactions) {
      await this.saveTransaction(transaction);
    }
    return transactions;
  }
}
