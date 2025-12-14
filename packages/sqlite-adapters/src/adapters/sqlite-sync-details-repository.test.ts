import type { ConfigValue } from "@ynab-plus/bootstrap";
import { SqliteDatabase } from "./sqlite-database.ts";
import { SqliteSyncDetailsRepository } from "./sqlite-sync-details-repository.ts";
import { testSyncDetailsRepository } from "@ynab-plus/data-adapter-tests";
import { mock } from "vitest-mock-extended";
import { type IDomainEventBuffer } from "@ynab-plus/app";

testSyncDetailsRepository(async () => {
  const eventBuffer = mock<IDomainEventBuffer>();
  const database = new SqliteDatabase(
    {
      value: Promise.resolve(":memory:"),
    },
    eventBuffer,
  );

  const tableName: ConfigValue<string> = {
    value: Promise.resolve("syncDetails"),
  };

  const repo = new SqliteSyncDetailsRepository(tableName, database, eventBuffer);

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
