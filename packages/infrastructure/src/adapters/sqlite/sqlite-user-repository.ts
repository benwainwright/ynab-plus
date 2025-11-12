import { User } from "@ynab-plus/domain";
import type { IRepository } from "@ynab-plus/app";

import type { ConfigValue } from "@ynab-plus/bootstrap";
import type { SqliteDatabase } from "./sqlite-database.ts";

export class SqliteUserRepository implements IRepository<User> {
  public constructor(
    private tableName: ConfigValue<string>,
    private database: SqliteDatabase,
  ) {}

  async get(id: string): Promise<User | undefined> {
    const result = await this.database.getFromDb<
      User & { permissions: string }
    >(
      `SELECT id, email, passwordHash, permissions
        FROM ${await this.tableName.value}
        where id = ?`,
      [id],
    );

    return result
      ? new User({
          ...result,
          permissions: JSON.parse(result.permissions),
        })
      : undefined;
  }

  async getMany(start?: number, limit?: number): Promise<User[]> {
    const result = await this.database.getAllFromDatabase<
      (User & { permissions: string })[]
    >(
      `SELECT id, email, passwordHash, permissions
        FROM ${await this.tableName.value}
        LIMIT ? OFFSET ?`,
      [limit ?? 30, start ?? 0],
    );

    return result.map(
      (result) =>
        new User({
          ...result,
          permissions: JSON.parse(result.permissions),
        }),
    );
  }

  public async create() {
    this.database.runQuery(
      `CREATE TABLE IF NOT EXISTS ${await this.tableName.value} (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          passwordHash TEXT NOT NULL,
          permissions TEXT
      );`,
      [],
    );
  }

  public async save(thing: User): Promise<User> {
    const data = await this.database.getFromDb<User & { permissions: string }>(
      `INSERT INTO ${await this.tableName.value} (id, email, passwordHash, permissions)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          email    = excluded.email,
          passwordHash    = excluded.passwordHash,
          permissions = excluded.permissions
        RETURNING id, email, passwordHash, permissions;`,
      [
        thing.id,
        thing.email,
        thing.passwordHash,
        JSON.stringify(thing.permissions),
      ],
    );
    return new User({
      ...data,
      permissions: JSON.parse(data.permissions),
    });
  }
}
