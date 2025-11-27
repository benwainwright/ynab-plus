import type { IBankConnectionRepository } from "@ynab-plus/app";
import type { ConfigValue } from "@ynab-plus/bootstrap";
import { BankConnection } from "@ynab-plus/domain";
import { SqliteDatabase } from "./sqlite-database.ts";
import { injectable } from "inversify";
import { $inject } from "@core";

interface RawBankConnection {
  id: string;
  userId: string;
  bankName: string;
  logo: string;
  requisitionId: string | null;
  token: string | null;
  tokenExpiry: string | null;
  refreshToken: string | null;
  refreshTokenExpiry: string | null;
}

@injectable()
export class SqliteBankConnectionRepository
  implements IBankConnectionRepository
{
  public constructor(
    @$inject("BankConnectionTableName")
    private tableName: ConfigValue<string>,
    @$inject("SqliteDatabase")
    private database: SqliteDatabase,
  ) {}

  public mapRaw(raw: RawBankConnection): BankConnection {
    return BankConnection.reconstite({
      ...raw,
      requisitionId: raw.requisitionId ?? undefined,
      token: raw.token ?? undefined,
      tokenExpiry: raw.tokenExpiry ? new Date(raw.tokenExpiry) : undefined,
      refreshToken: raw.refreshToken ?? undefined,
      refreshTokenExpiry: raw.refreshTokenExpiry
        ? new Date(raw.refreshTokenExpiry)
        : undefined,
    });
  }

  public async create(): Promise<void> {
    await this.database.runQuery(
      `CREATE TABLE IF NOT EXISTS ${await this.tableName.value} (
          id TEXT,
          userId TEXT PRIMARY KEY,
          bankName TEXT NOT NULL,
          logo TEXT NOT NULL,
          requisitionId TEXT,
          token TEXT,
          tokenExpiry TEXT,
          refreshToken TEXT,
          refreshTokenExpiry TEXT
      );`,
    );
  }

  public async getConnection(
    userId: string,
  ): Promise<BankConnection | undefined> {
    const result = await this.database.getFromDb<RawBankConnection | undefined>(
      `SELECT id, userId, bankName, logo, requisitionId, token, tokenExpiry, refreshToken, refreshTokenExpiry
        FROM ${await this.tableName.value} WHERE userId = ?`,
      [userId],
    );

    if (!result) {
      return undefined;
    }

    return this.mapRaw(result);
  }

  public async saveConnection(
    connection: BankConnection,
  ): Promise<BankConnection> {
    const data = await this.database.getFromDb<RawBankConnection>(
      `INSERT INTO ${await this.tableName.value} (id, userId, bankName, logo, requisitionId, token, tokenExpiry, refreshToken, refreshTokenExpiry)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id, userId, bankName, logo, requisitionId, token, tokenExpiry, refreshToken, refreshTokenExpiry`,
      [
        connection.id,
        connection.userId,
        connection.bankName,
        connection.logo,
        connection.freezeDry().requisitionId ?? null,
        connection.freezeDry(true).token ?? null,
        connection.freezeDry(true).tokenExpiry?.toISOString() ?? null,
        connection.freezeDry(true).refreshToken ?? null,
        connection.freezeDry(true).refreshTokenExpiry?.toISOString(),
      ],
    );

    return this.mapRaw(data);
  }

  public async deleteConnection(connection: BankConnection): Promise<void> {
    await this.database.runQuery(
      `DELETE FROM ${await this.tableName.value}
      WHERE userId = ?`,
      [connection.userId],
    );
  }
}
