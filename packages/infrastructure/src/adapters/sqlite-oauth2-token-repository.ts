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
    const db = await this.database.getDatabase();
    db.query(
      `CREATE TABLE IF NOT EXISTS ${await this.tableName.value} (
          userId TEXT,
          provider TEXT,
          token TEXT,
          refreshToken TEXT,
          expiry TEXT,
          PRIMARY KEY (userId, provider)
      );`,
    ).run();
  }

  public async get(
    userId: string,
    provider: string,
  ): Promise<OauthToken | undefined> {
    const db = await this.database.getDatabase();
    const result = db
      .query(
        `SELECT userId, provider, token, refreshToken, expiry
         FROM ${await this.tableName.value} WHERE userId = $userId AND provider = $provider;`,
      )
      .get({ userId: userId, provider: provider }) as OauthToken & {
      expiry: string;
    };

    return result
      ? new OauthToken({
          ...result,
          expiry: new Date(result.expiry),
        })
      : undefined;
  }

  public async save(token: OauthToken): Promise<OauthToken> {
    const db = await this.database.getDatabase();
    return new OauthToken({
      ...(db
        .query(
          `INSERT INTO ${await this.tableName.value} (userId, provider, token, refreshToken, expiry)
          VALUES ($userId, $provider, $token, $refreshToken, $expiry)
          ON CONFLICT(userId, provider) DO UPDATE SET
            token = excluded.token,
            refreshToken = excluded.refreshToken,
            expiry = excluded.expiry

          RETURNING userId, provider, token, refreshToken, expiry;`,
        )
        .get({
          token: token.token,
          refreshToken: token.refreshToken,
          provider: token.provider,
          userId: token.userId,
          expiry: token.expiry.toISOString(),
        }) as OauthToken),
    });
  }
}
