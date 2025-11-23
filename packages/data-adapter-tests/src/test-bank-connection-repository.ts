import type { IBankConnectionRepository } from "@ynab-plus/app";
import { BankConnection } from "@ynab-plus/domain";

export const testBankConnectionRepository = (
  create: () => Promise<IBankConnectionRepository>,
) => {
  describe("the connection repository", () => {
    it("can update and return a connection", async () => {
      const repo = await create();

      const connectionOne = BankConnection.reconstite({
        bankName: "foo",
        id: "foo-2",
        userId: "ben",
        logo: "bar",
        requisitionId: "baz",
        token: "token",
        refreshToken: "refreshToken",
        tokenExpiry: new Date(),
        refreshTokenExpiry: new Date(),
      });

      const connectionTwo = BankConnection.reconstite({
        bankName: "foo",
        id: "foo-3",
        userId: "fred",
        logo: "bar",
        requisitionId: "baz",
        token: "token",
        refreshToken: "refreshToken",
        tokenExpiry: new Date(),
        refreshTokenExpiry: new Date(),
      });

      await repo.saveConnection(connectionOne);
      await repo.saveConnection(connectionTwo);

      const recieved = await repo.getConnection("ben");

      expect(recieved).toEqual(connectionOne);
    });

    it("can delete a token", async () => {
      const repo = await create();

      const connectionOne = BankConnection.reconstite({
        bankName: "foo",
        id: "foo-2",
        userId: "ben",
        logo: "bar",
        requisitionId: "baz",
        token: "token",
        refreshToken: "refreshToken",
        tokenExpiry: new Date(),
        refreshTokenExpiry: new Date(),
      });

      const connectionTwo = BankConnection.reconstite({
        bankName: "foo",
        id: "foo-3",
        userId: "fred",
        logo: "bar",
        requisitionId: "baz",
        token: "token",
        refreshToken: "refreshToken",
        tokenExpiry: new Date(),
        refreshTokenExpiry: new Date(),
      });

      await repo.saveConnection(connectionOne);
      await repo.saveConnection(connectionTwo);

      await repo.deleteConnection(connectionOne);

      const empty = await repo.getConnection("ben");

      expect(empty).toEqual(undefined);
    });
  });
};
