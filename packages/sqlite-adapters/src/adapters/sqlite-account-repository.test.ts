import type { ConfigValue } from "@ynab-plus/bootstrap";
import { testAccountsRepository } from "@ynab-plus/data-adapter-tests";

import { Sqlite3AccountRepository } from "./sqlite-account-repository.ts";
import { SqliteDatabase } from "./sqlite-database.ts";

testAccountsRepository(async () => {
  const database = new SqliteDatabase({
    value: Promise.resolve(":memory:"),
  });

  const tableName: ConfigValue<string> = {
    value: Promise.resolve("tokens"),
  };

  const repo = new Sqlite3AccountRepository(tableName, database);

  await repo.create();

  return repo;
});
