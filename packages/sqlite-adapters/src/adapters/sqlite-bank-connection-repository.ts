import type { IBankConnectionRepository, IDomainEventBuffer } from "@ynab-plus/app";
import type { ConfigValue } from "@ynab-plus/bootstrap";
import { BankConnection } from "@ynab-plus/domain";
import { SqliteDatabase } from "./sqlite-database.ts";
import { injectable } from "inversify";
import { inject } from "@core";

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
export class SqliteBankConnectionRepository implements IBankConnectionRepository {
  public constructor(
    @inject("BankConnectionTableName")
    private tableName: ConfigValue<string>,

    @inject("SqliteDatabase")
    private database: SqliteDatabase,

    @inject("DomainEventBuffer")
    private domainEventStore: IDomainEventBuffer,
  ) {}

  public mapRaw(raw: RawBankConnection): BankConnection {
    return BankConnection.reconstite({
      ...raw,
      requisitionId: raw.requisitionId ?? undefined,
    });
  }

  public async create(): Promise<void> {
    await this.database.runQuery(
      `CREATE TABLE IF NOT EXISTS ${await this.tableName.value} (
          id TEXT,
          userId TEXT PRIMARY KEY,
          bankName TEXT NOT NULL,
          logo TEXT NOT NULL,
          requisitionId TEXT
      );`,
    );
  }

  public async getConnection(userId: string): Promise<BankConnection | undefined> {
    const result = await this.database.getFromDb<RawBankConnection | undefined>(
      `SELECT id, userId, bankName, logo, requisitionId
        FROM ${await this.tableName.value} WHERE userId = ?`,
      [userId],
    );

    if (!result) {
      return undefined;
    }

    return this.mapRaw(result);
  }

  public async saveConnection(connection: BankConnection): Promise<BankConnection> {
    this.domainEventStore.stageEvents(connection);
    await this.database.deferQueryToTransaction(
      `INSERT INTO ${await this.tableName.value} (id, userId, bankName, logo, requisitionId)
        VALUES (?, ?, ?, ?, ?)
        RETURNING id, userId, bankName, logo, requisitionId`,
      [
        connection.id,
        connection.userId,
        connection.bankName,
        connection.logo,
        connection.freezeDry().requisitionId ?? null,
      ],
    );

    return connection;
  }

  public async deleteConnection(connection: BankConnection): Promise<void> {
    this.domainEventStore.stageEvents(connection);
    await this.database.deferQueryToTransaction(
      `DELETE FROM ${await this.tableName.value}
      WHERE userId = ?`,
      [connection.userId],
    );
  }
}
