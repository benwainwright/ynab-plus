import { type IOauthTokenRepository } from "@ynab-plus/app";
import type { ConfigValue } from "@ynab-plus/bootstrap";
import { OauthToken } from "@ynab-plus/domain";

interface RawOauthToken {
  token: string;
  refreshToken: string;
  provider: string;
  userId: string;
  expiry: string;
  lastUse?: string;
  refreshed?: string;
  created: string;
}

import { SqliteDatabase } from "./sqlite-database.ts";
import { injectable } from "inversify";
import { inject } from "@core";

@injectable()
export class SqliteOauth2TokenRepsoitory implements IOauthTokenRepository {
  public constructor(
    @inject("OauthTokenTableName")
    private tableName: ConfigValue<string>,

    @inject("SqliteDatabase")
    private database: SqliteDatabase,
  ) {}

  public async delete(userId: string, provider: string): Promise<void> {
    await this.database.runQuery(
      `DELETE FROM ${await this.tableName.value}
       WHERE userId = ? AND provider = ?`,
      [userId, provider],
    );
  }

  public async create() {
    await this.database.runQuery(
      `CREATE TABLE IF NOT EXISTS ${await this.tableName.value} (
          userId TEXT,
          provider TEXT,
          token TEXT NOT NULL,
          refreshToken TEXT NOT NULL,
          expiry TEXT NOT NULL,
          lastUse TEXT,
          refreshed TEXT,
          created TEXT NOT NULL,
          PRIMARY KEY (userId, provider)
      );`,
    );
  }

  public async get(
    userId: string,
    provider: string,
  ): Promise<OauthToken | undefined> {
    const result = await this.database.getFromDb<RawOauthToken | undefined>(
      `SELECT userId, provider, token, refreshToken, expiry, lastUse, refreshed, created
        FROM ${await this.tableName.value} WHERE userId = ? AND provider = ?`,
      [userId, provider],
    );

    return result
      ? OauthToken.reconstitute({
          ...result,
          expiry: new Date(result.expiry),
          lastUse: result.lastUse ? new Date(result.lastUse) : undefined,
          refreshed: result.refreshed ? new Date(result.refreshed) : undefined,
          created: new Date(result.created),
        })
      : undefined;
  }

  public async save(token: OauthToken): Promise<OauthToken> {
    const data = await this.database.getFromDb<RawOauthToken>(
      `INSERT INTO ${await this.tableName.value} (userId, provider, token, refreshToken, expiry, lastUse, refreshed, created)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(userId, provider) DO UPDATE SET
            token = excluded.token,
            refreshToken = excluded.refreshToken,
            expiry = excluded.expiry,
            lastUse = excluded.lastUse,
            refreshed = excluded.refreshed,
            created = excluded.created

          RETURNING userId, provider, token, refreshToken, expiry, lastUse, refreshed, created;`,
      [
        token.userId,
        token.provider,
        token.token,
        token.refreshToken,
        token.expiry.toISOString(),
        token.lastUse?.toISOString() ?? null,
        token.refreshed?.toISOString() ?? null,
        token.created.toISOString(),
      ],
    );

    return OauthToken.reconstitute({
      ...data,
      expiry: new Date(data.expiry),
      lastUse: data.lastUse ? new Date(data.lastUse) : undefined,
      refreshed: data.refreshed ? new Date(data.refreshed) : undefined,
      created: new Date(data.created),
    });
  }
}
