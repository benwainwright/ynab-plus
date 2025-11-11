import { describe, expect, it } from "bun:test";
import { OauthToken } from "@domain";
import type { ConfigValue } from "@bootstrap";
import { SqliteDatabase } from "./sqlite-database.ts";
import { SqliteOauth2TokenRepsoitory } from "./sqlite-oauth2-token-repository.ts";

describe("the user repository", () => {
  it("can update and return a user", async () => {
    const database = new SqliteDatabase({
      value: Promise.resolve(":memory:"),
    });

    const tableName: ConfigValue<string> = {
      value: Promise.resolve("tokens"),
    };

    const repo = new SqliteOauth2TokenRepsoitory(tableName, database);

    await repo.create();

    const tokenOne = new OauthToken({
      provider: "ynab",
      expiry: new Date("2025-12-11T20:39:37.823Z"),
      token: "foo",
      userId: "ben",
      refreshToken: "bar",
    });

    const tokenTwo = new OauthToken({
      provider: "monzo",
      userId: "ben",
      expiry: new Date("2025-11-11T20:39:37.823Z"),
      token: "foo-bar",
      refreshToken: "bap",
    });

    await repo.save(tokenTwo);
    await repo.save(tokenOne);

    const token = await repo.get("ben", "monzo");

    expect(token).toEqual(tokenTwo);
  });
});
