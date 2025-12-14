import { testTransactionRepository } from "@ynab-plus/data-adapter-tests";
import { SqliteDatabase } from "./sqlite-database.ts";
import { SqliteTransactionRepository } from "./sqlite-transaction-repository.ts";
import type { ConfigValue } from "@ynab-plus/bootstrap";
import { mock } from "vitest-mock-extended";
import { type IDomainEventBuffer } from "@ynab-plus/app";

testTransactionRepository(async () => {
  const eventBuffer = mock<IDomainEventBuffer>();
  const database = new SqliteDatabase(
    {
      value: Promise.resolve(":memory:"),
    },
    eventBuffer,
  );

  const tableName: ConfigValue<string> = {
    value: Promise.resolve("transactions"),
  };

  const repo = new SqliteTransactionRepository(tableName, database, eventBuffer);

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
