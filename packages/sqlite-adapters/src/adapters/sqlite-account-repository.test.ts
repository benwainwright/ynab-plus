import type { ConfigValue } from "@ynab-plus/bootstrap";
import { testAccountsRepository } from "@ynab-plus/data-adapter-tests";

import { Sqlite3AccountRepository } from "./sqlite-account-repository.ts";
import { SqliteDatabase } from "./sqlite-database.ts";
import { mock } from "vitest-mock-extended";
import { type IDomainEventBuffer } from "@ynab-plus/app";

testAccountsRepository(async () => {
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

  const repo = new Sqlite3AccountRepository(tableName, database, eventBuffer);

  await repo.create();

  return {
    repo,
    eventBuffer: eventBuffer,
    begin: async () => {
      await database.begin();
    },
    commit: async () => {
      await database.commit();
    },
  };
});
