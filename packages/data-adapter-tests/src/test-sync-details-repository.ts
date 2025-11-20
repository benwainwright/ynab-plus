import { SyncDetails, type ISyncDetails } from "@ynab-plus/domain";
import type { IRepository } from "@ynab-plus/app";

export const testSyncDetailsRepository = (
  create: () => Promise<IRepository<ISyncDetails>>,
) => {
  describe("sqlite sync details adapter", () => {
    it("can save and get sync details by id", async () => {
      const repo = await create();

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

    it("allows you to delete sync details", async () => {
      const repo = await create();

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
      await repo.delete(newDetails1);

      const receivedDetails = await repo.get("foo-bar-1");

      expect(receivedDetails).toEqual(undefined);
    });

    it("returns undefined if it doesn't exist", async () => {
      const repo = await create();

      const receivedDetails = await repo.get("foo-bar-1");

      expect(receivedDetails).toEqual(undefined);
    });
  });
};
