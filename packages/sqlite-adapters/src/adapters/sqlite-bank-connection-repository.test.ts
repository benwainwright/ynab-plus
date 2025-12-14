import { testBankConnectionRepository } from "@ynab-plus/data-adapter-tests";
import { SqliteBankConnectionRepository } from "./sqlite-bank-connection-repository.ts";
import { SqliteDatabase } from "./sqlite-database.ts";
import type { ConfigValue } from "@ynab-plus/bootstrap";
import { mock } from "vitest-mock-extended";
import { type IDomainEventBuffer } from "@ynab-plus/app";

testBankConnectionRepository(async () => {
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

  const repo = new SqliteBankConnectionRepository(tableName, database, eventBuffer);

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
