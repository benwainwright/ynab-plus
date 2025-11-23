import { testBankConnectionRepository } from "@ynab-plus/data-adapter-tests";
import { SqliteBankConnectionRepository } from "./sqlite-bank-connection-repository.ts";
import { SqliteDatabase } from "./sqlite-database.ts";
import type { ConfigValue } from "@ynab-plus/bootstrap";

testBankConnectionRepository(async () => {
  const database = new SqliteDatabase({
    value: Promise.resolve(":memory:"),
  });

  const tableName: ConfigValue<string> = {
    value: Promise.resolve("tokens"),
  };

  const repo = new SqliteBankConnectionRepository(tableName, database);

  await repo.create();

  return repo;
});
