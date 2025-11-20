import { testTransactionRepository } from "@ynab-plus/data-adapter-tests";
import { SqliteDatabase } from "./sqlite-database.ts";
import { SqliteTransactionRepository } from "./sqlite-transaction-repository.ts";
import type { ConfigValue } from "@ynab-plus/bootstrap";

testTransactionRepository(async () => {
  const database = new SqliteDatabase({
    value: Promise.resolve(":memory:"),
  });

  const tableName: ConfigValue<string> = {
    value: Promise.resolve("transactions"),
  };

  const repo = new SqliteTransactionRepository(tableName, database);

  await repo.create();

  return repo;
});
