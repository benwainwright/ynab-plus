import type { ConfigValue } from "@ynab-plus/bootstrap";
import { testOauthRepository } from "@ynab-plus/data-adapter-tests";

import { SqliteDatabase } from "./sqlite-database.ts";
import { SqliteOauth2TokenRepsoitory } from "./sqlite-oauth2-token-repository.ts";

testOauthRepository(async () => {
  const database = new SqliteDatabase({
    value: Promise.resolve(":memory:"),
  });

  const tableName: ConfigValue<string> = {
    value: Promise.resolve("tokens"),
  };

  const repo = new SqliteOauth2TokenRepsoitory(tableName, database);

  await repo.create();

  return repo;
});
