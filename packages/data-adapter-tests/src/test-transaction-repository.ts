import type { IDomainEventBuffer, ITransactionRepository } from "@ynab-plus/app";
import { Transaction } from "@ynab-plus/domain";
import type { Mocked } from "vitest";

export const testTransactionRepository = (
  create: () => Promise<{
    repo: ITransactionRepository;
    begin: () => Promise<void>;
    commit: () => Promise<void>;
    eventBuffer: Mocked<IDomainEventBuffer>;
  }>,
) => {
  describe("The transaction repository", () => {
    it("allows you to save and retrieve individual transactions", async () => {
      const { repo, begin, commit, eventBuffer } = await create();

      const transaction1 = Transaction.reconstitute({
        userId: "ben",
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
        userId: "ben",
        id: "biz",
        accountId: "bop",
        amount: 100,
        cleared: "uncleared",
        date: new Date(),
        approved: false,
        payee: "foo",
        memo: "foo",
      });

      await begin();
      await repo.saveTransaction(transaction1);
      await repo.saveTransaction(transaction2);
      expect(eventBuffer.stageEvents).toHaveBeenCalledWith(transaction1);
      expect(eventBuffer.stageEvents).toHaveBeenCalledWith(transaction2);
      await commit();

      const result = await repo.getTransaction("foo");

      expect(result).toEqual(transaction1);
    });

    it("allows you to save and retrieve transacions by account", async () => {
      const { repo, begin, commit, eventBuffer } = await create();

      const fredTransaction = Transaction.reconstitute({
        id: "bing",
        accountId: "bar",
        payee: "foo",
        amount: 100,
        userId: "fred",
        cleared: "cleared",
        date: new Date(),
        approved: false,
        memo: "foo",
      });

      const accountTransactions = [
        Transaction.reconstitute({
          id: "foo",
          payee: "foo",
          accountId: "bar",
          amount: 1000,
          userId: "ben",
          cleared: "cleared",
          date: new Date(),
          approved: false,
          memo: "foo",
        }),
        Transaction.reconstitute({
          id: "biz",
          userId: "ben",
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
          userId: "ben",
          cleared: "cleared",
          date: new Date(),
          approved: false,
          memo: "foo",
        }),
      ];

      await begin();
      await repo.saveTransactions([...accountTransactions, fredTransaction]);
      expect(eventBuffer.stageEvents).toHaveBeenCalledWith(accountTransactions[0]);

      const separateAccountTransaction = Transaction.reconstitute({
        id: "barp2",
        accountId: "bar",
        payee: "foo",
        userId: "ben",
        amount: 100,
        cleared: "uncleared",
        date: new Date(),
        approved: false,
        memo: "foo",
      });

      await repo.saveTransaction(separateAccountTransaction);

      await repo.saveTransactions([
        Transaction.reconstitute({
          userId: "ben",
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
          userId: "ben",
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

      await commit();
      const result = await repo.getAccountTransactions("ben", "bar", 0, 30);
      expect(result).toHaveLength(4);

      expect(result).toEqual(
        expect.arrayContaining([...accountTransactions, separateAccountTransaction]),
      );

      expect(result).not.toEqual(expect.arrayContaining([fredTransaction]));
    });

    it("allows you to retrieve a total count of txs in a given account", async () => {
      const { repo, begin, commit } = await create();

      const accountTransactions = [
        Transaction.reconstitute({
          userId: "fred",
          id: "burpie",
          accountId: "bar",
          amount: 100,
          payee: "foo",
          cleared: "cleared",
          date: new Date(),
          approved: false,
          memo: "foo",
        }),
        Transaction.reconstitute({
          userId: "ben",
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
          userId: "ben",
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
          userId: "ben",
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

      await begin();
      await repo.saveTransactions(accountTransactions);

      const separateAccountTransaction = Transaction.reconstitute({
        userId: "ben",
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
          userId: "ben",
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
          userId: "ben",
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

      await commit();
      const result = await repo.getAccountTransactionCount("ben", "bar");
      expect(result).toEqual(4);
    });
  });
};
