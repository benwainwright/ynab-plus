import { User } from "@ynab-plus/domain";
import type { IRepository } from "@ynab-plus/app";

import type { ConfigValue } from "@ynab-plus/bootstrap";
import type { SqliteDatabase } from "./sqlite-database.ts";

export class SqliteUserRepository implements IRepository<User> {
  public constructor(
    private tableName: ConfigValue<string>,
    private database: SqliteDatabase,
  ) {}

  async getMany(start?: number, limit?: number): Promise<User[]> {
    const db = await this.database.getDatabase();
    const result = db
      .query(
        `SELECT id, email, passwordHash, permissions
        FROM ${await this.tableName.value}
        LIMIT $limit OFFSET $offset`,
      )
      .all({ limit: limit ?? 30, offset: start ?? 0 }) as (User & {
      permissions: string;
    })[];

    return result.map(
      (result) =>
        new User({
          ...result,
          permissions: JSON.parse(result.permissions),
        }),
    );
  }

  public async create() {
    const db = await this.database.getDatabase();
    db.query(
      `CREATE TABLE IF NOT EXISTS ${await this.tableName.value} (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          passwordHash TEXT NOT NULL,
          permissions TEXT
      );`,
    ).run();
  }

  public async get(id: string): Promise<User | undefined> {
    const db = await this.database.getDatabase();
    const result = db
      .query(
        `SELECT id, email, passwordHash, permissions
         FROM ${await this.tableName.value} WHERE id = $id;`,
      )
      .get({ id: id }) as (User & { permissions: string }) | null;

    return result
      ? new User({
          ...result,
          permissions: JSON.parse(result.permissions),
        })
      : undefined;
  }

  public async save(thing: User): Promise<User> {
    const db = await this.database.getDatabase();
    return new User({
      ...(db
        .query(
          `INSERT INTO ${await this.tableName.value} (id, email, passwordHash, permissions)
          VALUES ($id, $email, $passwordHash, $permissions)
          ON CONFLICT(id) DO UPDATE SET
            email    = excluded.email,
            passwordHash    = excluded.passwordHash,
            permissions = excluded.permissions
          RETURNING id, email, passwordHash, permissions;`,
        )
        .get({
          id: thing.id,
          email: thing.email,
          passwordHash: thing.passwordHash,
          permissions: JSON.stringify(thing.permissions),
        }) as User),
    });
  }
}
