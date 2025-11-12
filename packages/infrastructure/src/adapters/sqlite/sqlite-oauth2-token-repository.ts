import type { IOauthTokenRepository } from "@ynab-plus/app";
import type { ConfigValue } from "@ynab-plus/bootstrap";
import { OauthToken } from "@ynab-plus/domain";
import type { SqliteDatabase } from "./sqlite-database.ts";

export class SqliteOauth2TokenRepsoitory implements IOauthTokenRepository {
  public constructor(
    private tableName: ConfigValue<string>,
    private database: SqliteDatabase,
  ) {}

  public async create() {
    this.database.runQuery(
      `CREATE TABLE IF NOT EXISTS ${await this.tableName.value} (
          userId TEXT,
          provider TEXT,
          token TEXT,
          refreshToken TEXT,
          expiry TEXT,
          PRIMARY KEY (userId, provider)
      );`,
    );
  }

  public async get(
    userId: string,
    provider: string,
  ): Promise<OauthToken | undefined> {
    const result = await this.database.getFromDb<
      OauthToken & { expiry: string }
    >(
      `SELECT userId, provider, token, refreshToken, expiry
        FROM ${await this.tableName.value} WHERE userId = ? AND provider = ?`,
      [userId, provider],
    );

    return result
      ? new OauthToken({
          ...result,
          expiry: new Date(result.expiry),
        })
      : undefined;
  }

  public async save(token: OauthToken): Promise<OauthToken> {
    const data = await this.database.getFromDb<OauthToken & { expiry: string }>(
      `INSERT INTO ${await this.tableName.value} (userId, provider, token, refreshToken, expiry)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(userId, provider) DO UPDATE SET
            token = excluded.token,
            refreshToken = excluded.refreshToken,
            expiry = excluded.expiry

          RETURNING userId, provider, token, refreshToken, expiry;`,
      [
        token.userId,
        token.provider,
        token.token,
        token.refreshToken,
        token.expiry.toISOString(),
      ],
    );

    return new OauthToken({
      ...data,
      expiry: new Date(data.expiry),
    });
  }
}
