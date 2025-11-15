import type { ConfigValue } from "@ynab-plus/bootstrap";
import { Account, OauthToken } from "@ynab-plus/domain";
import { describe, expect, it } from "vitest";
import { Sqlite3AccountRepository } from "./sqlite-account-repository.ts";

import { SqliteDatabase } from "./sqlite-database.ts";

describe("the account repository", () => {
  it("can update and return an account", async () => {
    const database = new SqliteDatabase({
      value: Promise.resolve(":memory:"),
    });

    const tableName: ConfigValue<string> = {
      value: Promise.resolve("tokens"),
    };

    const repo = new Sqlite3AccountRepository(tableName, database);

    await repo.create();

    const accountOne = new Account({
      id: "one",
      userId: "ben",
      name: "hello",
      type: "checking",
      closed: false,
      note: "a note",
      deleted: false,
    });

    const accountTwo = new Account({
      id: "two",
      userId: "ben",
      name: "hello",
      type: "checking",
      closed: false,
      note: "a note",
      deleted: false,
    });

    await repo.save(accountOne);
    await repo.save(accountTwo);

    const token = await repo.get("two");

    expect(token).toEqual(accountTwo);
  });

  it("can return all of the current accounts for a user", async () => {
    const database = new SqliteDatabase({
      value: Promise.resolve(":memory:"),
    });

    const tableName: ConfigValue<string> = {
      value: Promise.resolve("tokens"),
    };

    const repo = new Sqlite3AccountRepository(tableName, database);

    await repo.create();

    const accountOne = new Account({
      id: "one",
      userId: "ben",
      name: "hello",
      type: "checking",
      closed: false,
      note: "a note",
      deleted: false,
    });

    const accountTwo = new Account({
      id: "two",
      userId: "ben",
      name: "hello",
      type: "checking",
      closed: false,
      note: "a note",
      deleted: false,
    });

    const accountThree = new Account({
      id: "three",
      userId: "fred",
      name: "hello",
      type: "checking",
      closed: false,
      note: "a note",
      deleted: false,
    });

    await repo.save(accountOne);
    await repo.save(accountTwo);
    await repo.save(accountThree);

    const accounts = await repo.getUserAccounts("ben");

    expect(accounts).toHaveLength(2);
    expect(accounts[0]).toEqual(accountOne);
    expect(accounts[1]).toEqual(accountTwo);
  });
});
