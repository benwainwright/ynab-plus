import type { ConfigValue } from "@ynab-plus/bootstrap";

import { SqliteDatabase } from "./sqlite-database.ts";
import { SqliteUserRepository } from "./sqlite-user-repository.ts";
import { testUserRepository } from "@ynab-plus/data-adapter-tests";
import { mock } from "vitest-mock-extended";
import type { IDomainEventBuffer } from "@ynab-plus/app";

testUserRepository(async () => {
  const eventBuffer = mock<IDomainEventBuffer>();
  const database = new SqliteDatabase(
    {
      value: Promise.resolve(":memory:"),
    },
    eventBuffer,
  );

  const tableName: ConfigValue<string> = {
    value: Promise.resolve("user"),
  };

  const repo = new SqliteUserRepository(tableName, database, eventBuffer);

  await repo.create();

  return {
    repo,
    eventBuffer,
    begin: async () => {
      await database.begin();
    },
    commit: async () => {
      await database.commit();
    },
  };
});
