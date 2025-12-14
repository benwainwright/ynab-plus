import { SyncDetails, type ISyncDetails } from "@ynab-plus/domain";
import type { IDomainEventBuffer, IRepository, IUnitOfWork } from "@ynab-plus/app";
import type { Mocked } from "vitest";

export const testSyncDetailsRepository = (
  create: () => Promise<{
    repo: IRepository<ISyncDetails>;
    unitOfWork: IUnitOfWork;
    eventBuffer: Mocked<IDomainEventBuffer>;
  }>,
) => {
  describe("sqlite sync details adapter", () => {
    it("can save and get sync details by id", async () => {
      const { repo, unitOfWork, eventBuffer } = await create();

      const newDetails1 = SyncDetails.reconstitute({
        id: "foo-bar-1",
        provider: "ynab",
        checkpoint: "blah",
        lastSync: new Date("2025-12-10T20:39:37.823Z"),
      });

      const newDetails2 = SyncDetails.reconstitute({
        id: "foo-bar-2",
        provider: "ynab",
        checkpoint: "blah",
        lastSync: new Date("2025-12-10T20:39:37.823Z"),
      });

      await unitOfWork.begin();

      await repo.save(newDetails1);
      await repo.save(newDetails2);
      expect(eventBuffer.stageEvents).toHaveBeenCalledWith(newDetails1);
      expect(eventBuffer.stageEvents).toHaveBeenCalledWith(newDetails2);

      await unitOfWork.commit();

      const receivedDetails = await repo.get("foo-bar-1");

      expect(receivedDetails).toEqual(newDetails1);
    });

    it("allows you to delete sync details", async () => {
      const { repo, unitOfWork, eventBuffer } = await create();

      const newDetails1 = SyncDetails.reconstitute({
        id: "foo-bar-1",
        provider: "ynab",
        checkpoint: "blah",
        lastSync: new Date("2025-12-10T20:39:37.823Z"),
      });

      const newDetails2 = SyncDetails.reconstitute({
        id: "foo-bar-2",
        provider: "ynab",
        checkpoint: "blah",
        lastSync: new Date("2025-12-10T20:39:37.823Z"),
      });

      await unitOfWork.begin();
      await repo.save(newDetails1);
      await repo.save(newDetails2);
      await unitOfWork.commit();
      await unitOfWork.begin();
      eventBuffer.stageEvents.mockReset();
      await repo.delete(newDetails1);

      expect(eventBuffer.stageEvents).toHaveBeenCalledWith(newDetails1);

      await unitOfWork.commit();

      const receivedDetails = await repo.get("foo-bar-1");

      expect(receivedDetails).toEqual(undefined);
    });

    it("returns undefined if it doesn't exist", async () => {
      const { repo } = await create();

      const receivedDetails = await repo.get("foo-bar-1");

      expect(receivedDetails).toEqual(undefined);
    });
  });
};
