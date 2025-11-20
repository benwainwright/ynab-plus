import type { ITransactionRepository } from "@ynab-plus/app";
import { Transaction } from "@ynab-plus/domain";

export const testTransactionRepository = (
  create: () => Promise<ITransactionRepository>,
) => {
  describe("The transaction repository", () => {
    it("allows you to save and retrieve individual transactions", async () => {
      const repo = await create();

      const transaction1 = new Transaction({
        id: "foo",
        accountId: "bar",
        amount: 1000,
        cleared: true,
        date: new Date(),
        approved: false,
        memo: "foo",
      });

      const transaction2 = new Transaction({
        id: "biz",
        accountId: "bop",
        amount: 100,
        cleared: false,
        date: new Date(),
        approved: false,
        memo: "foo",
      });

      await repo.saveTransaction(transaction1);
      await repo.saveTransaction(transaction2);

      const result = await repo.getTransaction("foo");

      expect(result).toEqual(transaction1);
    });

    it("allows you to save and retrieve transacions by account", async () => {
      const repo = await create();

      const accountTransactions = [
        new Transaction({
          id: "foo",
          accountId: "bar",
          amount: 1000,
          cleared: true,
          date: new Date(),
          approved: false,
          memo: "foo",
        }),
        new Transaction({
          id: "biz",
          accountId: "bar",
          amount: 100,
          cleared: false,
          date: new Date(),
          approved: false,
          memo: "foo",
        }),
        new Transaction({
          id: "bing",
          accountId: "bar",
          amount: 100,
          cleared: false,
          date: new Date(),
          approved: false,
          memo: "foo",
        }),
      ];

      await repo.saveTransactions(accountTransactions);

      const separateAccountTransaction = new Transaction({
        id: "barp2",
        accountId: "bar",
        amount: 100,
        cleared: false,
        date: new Date(),
        approved: false,
        memo: "foo",
      });

      await repo.saveTransaction(separateAccountTransaction);

      await repo.saveTransactions([
        new Transaction({
          id: "barp",
          accountId: "bof",
          amount: 100,
          cleared: false,
          date: new Date(),
          approved: false,
          memo: "foo",
        }),

        new Transaction({
          id: "burpie",
          accountId: "bof",
          amount: 100,
          cleared: false,
          date: new Date(),
          approved: false,
          memo: "foo",
        }),
      ]);

      const result = await repo.getAccountTransactions("bar", 30, 0);
      expect(result).toHaveLength(4);

      expect(result).toEqual(
        expect.arrayContaining([
          ...accountTransactions,
          separateAccountTransaction,
        ]),
      );
    });
  });
};
