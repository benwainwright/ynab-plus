import type { IBankConnectionRepository, IDomainEventBuffer } from "@ynab-plus/app";
import { BankConnection } from "@ynab-plus/domain";
import type { Mocked } from "vitest";

export const testBankConnectionRepository = (
  create: () => Promise<{
    repo: IBankConnectionRepository;
    eventBuffer: Mocked<IDomainEventBuffer>;
    begin: () => Promise<void>;
    commit: () => Promise<void>;
  }>,
) => {
  describe("the connection repository", () => {
    it("can update and return a connection", async () => {
      const { repo, begin, commit, eventBuffer } = await create();

      await begin();

      const connectionOne = BankConnection.reconstite({
        bankName: "foo",
        id: "foo-2",
        userId: "ben",
        logo: "bar",
        requisitionId: "baz",
        accounts: ["foo", "bar"],
      });

      const connectionTwo = BankConnection.reconstite({
        bankName: "foo",
        id: "foo-3",
        userId: "fred",
        logo: "bar",
        requisitionId: "baz",
      });

      await repo.saveConnection(connectionOne);
      await repo.saveConnection(connectionTwo);
      expect(eventBuffer.stageEvents).toHaveBeenCalledWith(connectionOne);
      expect(eventBuffer.stageEvents).toHaveBeenCalledWith(connectionTwo);

      await commit();

      const recieved = await repo.getConnection("ben");

      expect(recieved).toEqual(connectionOne);
    });

    it("can delete a token", async () => {
      const { repo, begin, commit, eventBuffer } = await create();

      const connectionOne = BankConnection.reconstite({
        bankName: "foo",
        id: "foo-2",
        userId: "ben",
        logo: "bar",
        requisitionId: "baz",
      });

      const connectionTwo = BankConnection.reconstite({
        bankName: "foo",
        id: "foo-3",
        userId: "fred",
        logo: "bar",
        requisitionId: "baz",
      });

      await begin();
      await repo.saveConnection(connectionOne);
      await repo.saveConnection(connectionTwo);
      await commit();

      eventBuffer.stageEvents.mockReset();

      await begin();
      await repo.deleteConnection(connectionOne);
      expect(eventBuffer.stageEvents).toHaveBeenCalledWith(connectionOne);
      await commit();

      const empty = await repo.getConnection("ben");

      expect(empty).toEqual(undefined);
    });
  });
};
