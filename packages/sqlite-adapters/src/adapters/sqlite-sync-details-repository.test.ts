import type { ConfigValue } from "@ynab-plus/bootstrap";
import { SqliteDatabase } from "./sqlite-database.ts";
import { SqliteSyncDetailsRepository } from "./sqlite-sync-details-repository.ts";
import { testSyncDetailsRepository } from "@ynab-plus/data-adapter-tests";

testSyncDetailsRepository(async () => {
  const database = new SqliteDatabase({
    value: Promise.resolve(":memory:"),
  });

  const tableName: ConfigValue<string> = {
    value: Promise.resolve("syncDetails"),
  };

  const repo = new SqliteSyncDetailsRepository(tableName, database);

  await repo.create();

  return {
    repo,
    begin: async () =>{  await database.begin(); },
    commit: async () =>{  await database.commit(); },
  };
});
