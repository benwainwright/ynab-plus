import { describe, expect, it } from "bun:test";
import { SqliteUserRepository } from "./sqlite-user-repository.ts";
import { User } from "@ynab-plus/domain";

import type { ConfigValue } from "@ynab-plus/bootstrap";
import { SqliteDatabase } from "./sqlite-database.ts";

describe("the user repository", () => {
  it("can update and return a user", async () => {
    const database = new SqliteDatabase({
      value: Promise.resolve(":memory:"),
    });

    const tableName: ConfigValue<string> = {
      value: Promise.resolve("user"),
    };

    const repo = new SqliteUserRepository(tableName, database);

    await repo.create();

    const data = new User({
      email: "bwainwright28@gmail.com",
      id: "ben",
      passwordHash:
        "$argon2id$v=19$m=65536,t=2,p=1$n7G8BcbQsFanGrlBuFB/Y7dedcifW3P7brW8tyMwLsU$9Zdmy6ccSH6ABRNiP6SU+qKE0oYdqu5eexecCKyMDdk",
      permissions: ["user", "public"],
    });

    await repo.save(data);

    const user = await repo.get(data.id);

    expect(user).toEqual(data);
  });

  describe("getMany", () => {
    it("can return many users", async () => {
      const tableName: ConfigValue<string> = {
        value: Promise.resolve("user"),
      };

      const database = new SqliteDatabase({
        value: Promise.resolve(":memory:"),
      });

      const repo = new SqliteUserRepository(tableName, database);

      await repo.create();

      const data = new User({
        email: "bwainwright28@gmail.com",
        id: "ben",
        passwordHash:
          "$argon2id$v=19$m=65536,t=2,p=1$n7G8BcbQsFanGrlBuFB/Y7dedcifW3P7brW8tyMwLsU$9Zdmy6ccSH6ABRNiP6SU+qKE0oYdqu5eexecCKyMDdk",
        permissions: ["public", "user"],
      });

      const data2 = new User({
        email: "a@b.com",
        id: "ben2",
        passwordHash:
          "$argon2id$v=19$m=65536,t=2,p=1$n7G8BcbQsFanGrlBuFB/Y7dedcifW3P7brW8tyMwLsU$9Zdmy6ccSH6ABRNiP6SU+qKE0oYdqu5eexecCKyMDdk",
        permissions: ["public", "user"],
      });

      const data3 = new User({
        email: "a@c.com",
        id: "ben3",
        passwordHash:
          "$argon2id$v=19$m=65536,t=2,p=1$n7G8BcbQsFanGrlBuFB/Y7dedcifW3P7brW8tyMwLsU$9Zdmy6ccSH6ABRNiP6SU+qKE0oYdqu5eexecCKyMDdk",
        permissions: ["user"],
      });

      await repo.save(data);
      await repo.save(data2);
      await repo.save(data3);

      const users = await repo.getMany();

      expect(users).toEqual([data, data2, data3]);
    });
  });

  it("returns undefined if not present", async () => {
    const tableName: ConfigValue<string> = {
      value: Promise.resolve("user"),
    };

    const database = new SqliteDatabase({
      value: Promise.resolve(":memory:"),
    });

    const repo = new SqliteUserRepository(tableName, database);

    await repo.create();

    const user = await repo.get("foo");

    expect(user).toBeUndefined();
  });
});
