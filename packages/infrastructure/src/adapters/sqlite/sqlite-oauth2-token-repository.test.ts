import type { ConfigValue } from "@ynab-plus/bootstrap";
import { OauthToken } from "@ynab-plus/domain";
import { describe, expect, it } from "vitest";

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
      lastUse: new Date("2025-12-10T20:39:37.823Z"),
      refreshed: new Date("2025-07-10T20:39:37.823Z"),
      created: new Date("2025-05-10T20:39:37.823Z"),
    });

    const tokenTwo = new OauthToken({
      provider: "monzo",
      userId: "ben",
      expiry: new Date("2025-11-11T20:39:37.823Z"),
      token: "foo-bar",
      refreshToken: "bap",
      lastUse: new Date("2025-12-10T20:39:37.823Z"),
      refreshed: new Date("2025-10-10T20:39:37.823Z"),
      created: new Date("2025-11-10T20:39:37.823Z"),
    });

    await repo.save(tokenTwo);
    await repo.save(tokenOne);

    const token = await repo.get("ben", "monzo");

    expect(token).toEqual(tokenTwo);
  });
});
