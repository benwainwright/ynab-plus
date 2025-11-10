import { User } from "@domain";
import type { IRepository } from "@application";
import { Database } from "bun:sqlite";

export class SqliteUserRepository implements IRepository<User> {
  public constructor(
    private tableName: string,
    private database: Database,
  ) {}

  async getMany(start?: number, limit?: number): Promise<User[]> {
    const result = this.database
      .query(
        `SELECT id, email, passwordHash, permissions
        FROM ${this.tableName}
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

  public create() {
    this.database
      .query(
        `CREATE TABLE IF NOT EXISTS ${this.tableName} (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          passwordHash TEXT NOT NULL,
          permissions TEXT
      );`,
      )
      .run();
  }

  public async get(id: string): Promise<User | undefined> {
    const result = this.database
      .query(
        `SELECT id, email, passwordHash, permissions
         FROM ${this.tableName} WHERE id = $id;`,
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
    return new User({
      ...(this.database
        .query(
          `INSERT INTO ${this.tableName} (id, email, passwordHash, permissions)
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
