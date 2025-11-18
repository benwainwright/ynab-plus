import type { ConfigValue } from "@ynab-plus/bootstrap";
import { SqliteDatabase } from "./sqlite-database.ts";
import { SqliteSyncDetailsRepository } from "./sqlite-sync-details-repository.ts";
import { SyncDetails } from "@ynab-plus/domain";

describe("sqlite sync details adapter", () => {
  it("can save and get sync details by id", async () => {
    const database = new SqliteDatabase({
      value: Promise.resolve(":memory:"),
    });

    const tableName: ConfigValue<string> = {
      value: Promise.resolve("syncdetails"),
    };

    const repo = new SqliteSyncDetailsRepository(tableName, database);

    await repo.create();

    const newDetails1 = new SyncDetails({
      id: "foo-bar-1",
      provider: "ynab",
      checkpoint: "blah",
      lastSync: new Date("2025-12-10T20:39:37.823Z"),
    });

    const newDetails2 = new SyncDetails({
      id: "foo-bar-2",
      provider: "ynab",
      checkpoint: "blah",
      lastSync: new Date("2025-12-10T20:39:37.823Z"),
    });

    await repo.save(newDetails1);
    await repo.save(newDetails2);

    const receivedDetails = await repo.get("foo-bar-1");

    expect(receivedDetails).toEqual(newDetails1);
  });

  it("returns undefined if it doesn't exist", async () => {
    const database = new SqliteDatabase({
      value: Promise.resolve(":memory:"),
    });

    const tableName: ConfigValue<string> = {
      value: Promise.resolve("syncdetails"),
    };

    const repo = new SqliteSyncDetailsRepository(tableName, database);

    await repo.create();

    const receivedDetails = await repo.get("foo-bar-1");

    expect(receivedDetails).toEqual(undefined);
  });
});
