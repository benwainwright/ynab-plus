import type { ConfigValue } from "@ynab-plus/bootstrap";
import { testOauthRepository } from "@ynab-plus/data-adapter-tests";
import { mock } from "vitest-mock-extended";

import { SqliteDatabase } from "./sqlite-database.ts";
import { SqliteOauth2TokenRepsoitory } from "./sqlite-oauth2-token-repository.ts";
import type { IDomainEventBuffer } from "@ynab-plus/app";

testOauthRepository(async () => {
  const eventBuffer = mock<IDomainEventBuffer>();
  const database = new SqliteDatabase(
    {
      value: Promise.resolve(":memory:"),
    },
    eventBuffer,
  );

  const tableName: ConfigValue<string> = {
    value: Promise.resolve("tokens"),
  };

  const repo = new SqliteOauth2TokenRepsoitory(tableName, database, eventBuffer);

  await repo.create();

  return {
    eventBuffer,
    repo,
    begin: async () => {
      await database.begin();
    },
    commit: async () => {
      await database.commit();
    },
  };
});
