import { type IRepository, type IMultipleRepository } from "@ynab-plus/app";
import type { ConfigValue } from "@ynab-plus/bootstrap";

import { type Permission, User } from "@ynab-plus/domain";

import { SqliteDatabase } from "./sqlite-database.ts";
import { injectable } from "inversify";
import { inject } from "@core";

interface RawUser {
  id: string;
  passwordHash: string;
  email: string;
  permissions: string;
}

@injectable()
export class SqliteUserRepository
  implements IRepository<User>, IMultipleRepository<User>
{
  public constructor(
    @inject("UsersTableName")
    private tableName: ConfigValue<string>,

    @inject("SqliteDatabase")
    private database: SqliteDatabase,
  ) {}

  public async delete(user: User): Promise<void> {
    await this.database.runQuery(
      `DELETE FROM ${await this.tableName.value}
      WHERE id = ?`,
      [user.id],
    );
  }

  async get(id: string): Promise<User | undefined> {
    const result = await this.database.getFromDb<RawUser | undefined>(
      `SELECT id, email, passwordHash, permissions
        FROM ${await this.tableName.value}
        where id = ?`,
      [id],
    );

    return result
      ? User.reconstitute({
          ...result,
          permissions: JSON.parse(result.permissions) as Permission[],
        })
      : undefined;
  }

  async getMany(start?: number, limit?: number): Promise<User[]> {
    const result = await this.database.getAllFromDatabase<RawUser[]>(
      `SELECT id, email, passwordHash, permissions
        FROM ${await this.tableName.value}
        LIMIT ? OFFSET ?`,
      [limit ?? 30, start ?? 0],
    );

    return result.map((result) =>
      User.reconstitute({
        ...result,
        permissions: JSON.parse(result.permissions) as Permission[],
      }),
    );
  }

  public async create() {
    await this.database.runQuery(
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
    const data = await this.database.getFromDb<RawUser>(
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
    return User.reconstitute({
      ...data,
      permissions: JSON.parse(data.permissions) as Permission[],
    });
  }
}
