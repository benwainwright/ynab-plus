import { sqliteDbToken, sqlLiteUserRepoTableName } from "@tokens";
import type { IRepository, IUser } from "@types";
import { Database } from "bun:sqlite";
import { inject, injectable } from "inversify";

@injectable()
export class SqliteUserRepository implements IRepository<IUser> {
  public constructor(
    @inject(sqlLiteUserRepoTableName)
    private tableName: string,

    @inject(sqliteDbToken)
    private database: Database,
  ) {}

  async getMany(start?: number, limit?: number): Promise<IUser[]> {
    const result = this.database
      .query(
        `SELECT id, email, passwordHash, permissions
        FROM ${this.tableName}
        LIMIT $limit OFFSET $offset`,
      )
      .all({ limit: limit ?? 30, offset: start ?? 0 }) as (IUser & {
      permissions: string;
    })[];

    return result.map(
      (result) =>
        ({
          ...result,
          permissions: JSON.parse(result.permissions),
        }) as IUser,
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

  public async get(id: string): Promise<IUser | undefined> {
    const result = this.database
      .query(
        `SELECT id, email, passwordHash, permissions
         FROM ${this.tableName} WHERE id = $id;`,
      )
      .get({ id: id }) as (IUser & { permissions: string }) | null;

    return result
      ? ({
          ...result,
          permissions: JSON.parse(result.permissions),
        } as IUser)
      : undefined;
  }

  public async save(thing: IUser): Promise<IUser> {
    return this.database
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
      }) as IUser;
  }
}
