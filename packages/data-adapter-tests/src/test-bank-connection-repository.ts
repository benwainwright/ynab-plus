import type { IBankConnectionRepository } from "@ynab-plus/app";
import { BankConnection } from "@ynab-plus/domain";

export const testBankConnectionRepository = (
  create: () => Promise<{
    repo: IBankConnectionRepository;
    begin: () => Promise<void>;
    commit: () => Promise<void>;
  }>,
) => {
  describe("the connection repository", () => {
    it("can update and return a connection", async () => {
      const { repo, begin, commit } = await create();

      await begin();

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

      await repo.saveConnection(connectionOne);
      await repo.saveConnection(connectionTwo);

      await commit();

      const recieved = await repo.getConnection("ben");

      expect(recieved).toEqual(connectionOne);
    });

    it("can delete a token", async () => {
      const { repo, begin, commit } = await create();

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

      await begin();
      await repo.deleteConnection(connectionOne);
      await commit();

      const empty = await repo.getConnection("ben");

      expect(empty).toEqual(undefined);
    });
  });
};
