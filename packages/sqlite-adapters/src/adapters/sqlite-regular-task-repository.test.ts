import type { ConfigValue } from "@ynab-plus/bootstrap";
import { SqliteRegularTaskRepository } from "./sqlite-regular-tasks-repository.ts";

import { SqliteDatabase } from "./sqlite-database.ts";
import { testRegularTasksRepository } from "@ynab-plus/data-adapter-tests";

testRegularTasksRepository(async () => {
  const database = new SqliteDatabase({
    value: Promise.resolve(":memory:"),
  });

  const tableName: ConfigValue<string> = {
    value: Promise.resolve("tasks"),
  };

  const repo = new SqliteRegularTaskRepository(tableName, database);

  await repo.create();

  return {
    repo,
    begin: async () =>{  await database.begin(); },
    commit: async () =>{  await database.commit(); },
  };
});
