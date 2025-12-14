import type { ConfigValue } from "@ynab-plus/bootstrap";
import { SqliteRegularTaskRepository } from "./sqlite-regular-tasks-repository.ts";

import { SqliteDatabase } from "./sqlite-database.ts";
import { testRegularTasksRepository } from "@ynab-plus/data-adapter-tests";
import { mock } from "vitest-mock-extended";
import { type IDomainEventBuffer } from "@ynab-plus/app";

testRegularTasksRepository(async () => {
  const eventBuffer = mock<IDomainEventBuffer>();
  const database = new SqliteDatabase(
    {
      value: Promise.resolve(":memory:"),
    },
    eventBuffer,
  );

  const tableName: ConfigValue<string> = {
    value: Promise.resolve("tasks"),
  };

  const repo = new SqliteRegularTaskRepository(tableName, database, eventBuffer);

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
