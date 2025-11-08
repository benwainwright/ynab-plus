import type { IRepository, IUser } from "@types";
import { Database } from "bun:sqlite";

export class UserRepository implements IRepository<IUser> {
  public constructor(
    private tableName: string,
    private database: Database,
  ) {}

  public create() {
    this.database
      .query(
        `CREATE TABLE IF NOT EXISTS ${this.tableName} (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          passwordHash TEXT NOT NULL
      );`,
      )
      .run();
  }

  public async get(id: string): Promise<IUser | undefined> {
    const result = this.database
      .query(
        `SELECT id, username, email, passwordHash FROM ${this.tableName} WHERE id = $id;`,
      )
      .get({ id: id }) as IUser | null;

    return result ?? undefined;
  }
  public async save(thing: IUser): Promise<IUser> {
    return this.database
      .query(
        `INSERT INTO ${this.tableName} (id, username, email, passwordHash)
          VALUES ($id, $username, $email, $passwordHash)
          ON CONFLICT(id) DO UPDATE SET
            username = excluded.username,
            email    = excluded.email,
            passwordHash    = excluded.passwordHash
          RETURNING id, username, email, passwordHash;`,
      )
      .get({
        id: thing.id,
        username: thing.username,
        email: thing.email,
        passwordHash: thing.passwordHash,
      }) as IUser;
  }
}
