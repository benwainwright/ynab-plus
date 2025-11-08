import { describe, expect, it } from "bun:test";
import { UserRepository } from "./user-repository.ts";
import { Database } from "bun:sqlite";

describe("the user repository", () => {
  it("can update and return a user", async () => {
    const repo = new UserRepository(
      "user",
      new Database(":memory:", { strict: true }),
    );

    repo.create();

    const data = {
      id: "019a643d-7c86-7000-b504-208b6717b472",
      email: "bwainwright28@gmail.com",
      username: "ben",
      passwordHash:
        "$argon2id$v=19$m=65536,t=2,p=1$n7G8BcbQsFanGrlBuFB/Y7dedcifW3P7brW8tyMwLsU$9Zdmy6ccSH6ABRNiP6SU+qKE0oYdqu5eexecCKyMDdk",
    };

    await repo.save(data);

    const user = await repo.get(data.id);

    expect(user).toEqual(data);
  });

  it("returns undefined if not present", async () => {
    const repo = new UserRepository(
      "user",
      new Database(":memory:", { strict: true }),
    );

    repo.create();

    const user = await repo.get("foo");

    expect(user).toBeUndefined();
  });
});
