import type { ITransactionRepository } from "@ynab-plus/app";
import { Transaction } from "@ynab-plus/domain";

export const testTransactionRepository = (
  create: () => Promise<ITransactionRepository>,
) => {
  describe("The transaction repository", () => {
    it("allows you to save and retrieve individual transactions", async () => {
      const repo = await create();

      const transaction1 = Transaction.reconstitute({
        id: "foo",
        accountId: "bar",
        amount: 1000,
        cleared: "cleared",
        date: new Date(),
        approved: false,
        payee: "foo",
        memo: "foo",
      });

      const transaction2 = Transaction.reconstitute({
        id: "biz",
        accountId: "bop",
        amount: 100,
        cleared: "uncleared",
        date: new Date(),
        approved: false,
        payee: "foo",
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
        Transaction.reconstitute({
          id: "foo",
          payee: "foo",
          accountId: "bar",
          amount: 1000,
          cleared: "cleared",
          date: new Date(),
          approved: false,
          memo: "foo",
        }),
        Transaction.reconstitute({
          id: "biz",
          payee: "foo",
          accountId: "bar",
          amount: 100,
          cleared: "reconciled",
          date: new Date(),
          approved: false,
          memo: "foo",
        }),
        Transaction.reconstitute({
          id: "bing",
          accountId: "bar",
          payee: "foo",
          amount: 100,
          cleared: "cleared",
          date: new Date(),
          approved: false,
          memo: "foo",
        }),
      ];

      await repo.saveTransactions(accountTransactions);

      const separateAccountTransaction = Transaction.reconstitute({
        id: "barp2",
        accountId: "bar",
        payee: "foo",
        amount: 100,
        cleared: "uncleared",
        date: new Date(),
        approved: false,
        memo: "foo",
      });

      await repo.saveTransaction(separateAccountTransaction);

      await repo.saveTransactions([
        Transaction.reconstitute({
          id: "barp",
          accountId: "bof",
          amount: 100,
          payee: "foo",
          cleared: "cleared",
          date: new Date(),
          approved: false,
          memo: "foo",
        }),

        Transaction.reconstitute({
          id: "burpie",
          accountId: "bof",
          amount: 100,
          payee: "foo",
          cleared: "cleared",
          date: new Date(),
          approved: false,
          memo: "foo",
        }),
      ]);

      const result = await repo.getAccountTransactions("bar", 0, 30);
      expect(result).toHaveLength(4);

      expect(result).toEqual(
        expect.arrayContaining([
          ...accountTransactions,
          separateAccountTransaction,
        ]),
      );
    });

    it("allows you to retrieve a total count of txs in a given account", async () => {
      const repo = await create();

      const accountTransactions = [
        Transaction.reconstitute({
          id: "foo",
          payee: "foo",
          accountId: "bar",
          amount: 1000,
          cleared: "cleared",
          date: new Date(),
          approved: false,
          memo: "foo",
        }),
        Transaction.reconstitute({
          id: "biz",
          payee: "foo",
          accountId: "bar",
          amount: 100,
          cleared: "reconciled",
          date: new Date(),
          approved: false,
          memo: "foo",
        }),
        Transaction.reconstitute({
          id: "bing",
          accountId: "bar",
          payee: "foo",
          amount: 100,
          cleared: "cleared",
          date: new Date(),
          approved: false,
          memo: "foo",
        }),
      ];

      await repo.saveTransactions(accountTransactions);

      const separateAccountTransaction = Transaction.reconstitute({
        id: "barp2",
        accountId: "bar",
        payee: "foo",
        amount: 100,
        cleared: "uncleared",
        date: new Date(),
        approved: false,
        memo: "foo",
      });

      await repo.saveTransaction(separateAccountTransaction);

      await repo.saveTransactions([
        Transaction.reconstitute({
          id: "barp",
          accountId: "bof",
          amount: 100,
          payee: "foo",
          cleared: "cleared",
          date: new Date(),
          approved: false,
          memo: "foo",
        }),

        Transaction.reconstitute({
          id: "burpie",
          accountId: "bof",
          amount: 100,
          payee: "foo",
          cleared: "cleared",
          date: new Date(),
          approved: false,
          memo: "foo",
        }),
      ]);

      const result = await repo.getAccountTransactionCount("bar");
      expect(result).toEqual(4);
    });
  });
};
