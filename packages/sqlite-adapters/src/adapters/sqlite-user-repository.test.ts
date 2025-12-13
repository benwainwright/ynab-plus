import type { ConfigValue } from "@ynab-plus/bootstrap";

import { SqliteDatabase } from "./sqlite-database.ts";
import { SqliteUserRepository } from "./sqlite-user-repository.ts";
import { testUserRepository } from "@ynab-plus/data-adapter-tests";

testUserRepository(async () => {
  const database = new SqliteDatabase({
    value: Promise.resolve(":memory:"),
  });

  const tableName: ConfigValue<string> = {
    value: Promise.resolve("user"),
  };

  const repo = new SqliteUserRepository(tableName, database);

  await repo.create();

  return {
    repo,
    begin: async () =>{  await database.begin(); },
    commit: async () =>{  await database.commit(); },
  };
});
