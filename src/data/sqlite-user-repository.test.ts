import { describe, expect, it } from "bun:test";
import { SqliteUserRepository } from "./sqlite-user-repository.ts";
import { Database } from "bun:sqlite";
import type { IUser } from "@types";

describe("the user repository", () => {
  it("can update and return a user", async () => {
    const repo = new SqliteUserRepository(
      "user",
      new Database(":memory:", { strict: true }),
    );

    repo.create();

    const data: IUser = {
      email: "bwainwright28@gmail.com",
      id: "ben",
      passwordHash:
        "$argon2id$v=19$m=65536,t=2,p=1$n7G8BcbQsFanGrlBuFB/Y7dedcifW3P7brW8tyMwLsU$9Zdmy6ccSH6ABRNiP6SU+qKE0oYdqu5eexecCKyMDdk",
      permissions: ["user", "public"],
    };

    await repo.save(data);

    const user = await repo.get(data.id);

    expect(user).toEqual(data);
  });

  describe("getMany", () => {
    it("can return many users", async () => {
      const repo = new SqliteUserRepository(
        "user",
        new Database(":memory:", { strict: true }),
      );

      repo.create();

      const data: IUser = {
        email: "bwainwright28@gmail.com",
        id: "ben",
        passwordHash:
          "$argon2id$v=19$m=65536,t=2,p=1$n7G8BcbQsFanGrlBuFB/Y7dedcifW3P7brW8tyMwLsU$9Zdmy6ccSH6ABRNiP6SU+qKE0oYdqu5eexecCKyMDdk",
        permissions: ["public", "user"],
      };

      const data2: IUser = {
        email: "a@b.com",
        id: "ben2",
        passwordHash:
          "$argon2id$v=19$m=65536,t=2,p=1$n7G8BcbQsFanGrlBuFB/Y7dedcifW3P7brW8tyMwLsU$9Zdmy6ccSH6ABRNiP6SU+qKE0oYdqu5eexecCKyMDdk",
        permissions: ["public", "user"],
      };

      const data3: IUser = {
        email: "a@c.com",
        id: "ben3",
        passwordHash:
          "$argon2id$v=19$m=65536,t=2,p=1$n7G8BcbQsFanGrlBuFB/Y7dedcifW3P7brW8tyMwLsU$9Zdmy6ccSH6ABRNiP6SU+qKE0oYdqu5eexecCKyMDdk",
        permissions: ["user"],
      };

      await repo.save(data);
      await repo.save(data2);
      await repo.save(data3);

      const users = await repo.getMany();

      expect(users).toEqual([data, data2, data3]);
    });
  });

  it("returns undefined if not present", async () => {
    const repo = new SqliteUserRepository(
      "user",
      new Database(":memory:", { strict: true }),
    );

    repo.create();

    const user = await repo.get("foo");

    expect(user).toBeUndefined();
  });
});
