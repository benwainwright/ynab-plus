import { type IAccountRepository, type ITransactionRepository } from "@ports";
import { ListTransactionsService } from "./list-transactions-service.ts";
import { mock } from "vitest-mock-extended";
import { createMockServiceContext } from "@test-helpers";
import { Account, Transaction, User } from "@ynab-plus/domain";
import { when } from "vitest-when";

describe("list transactions service", () => {
  it("returns a list of all the transactions on a given page", async () => {
    const mockTxRepo = mock<ITransactionRepository>();

    const mockUser = User.reconstitute({
      id: "ben",
      passwordHash: "foo",
      permissions: ["user"],
      email: "email"
    });

    const context = createMockServiceContext(
      "ListTransactionsCommand",
      { offset: 0, limit: 30, accountId: "bar" },
      mockUser
    );

    const account = Account.reconstitute({
      balance: 1000,
      clearedBalance: 1_000,
      unclearedBalance: 10_000,
      id: "bar",
      userId: "ben",
      name: "hello",
      type: "checking",
      closed: false,
      note: "a note",
      deleted: false
    });

    const transactions = [
      Transaction.reconstitute({
        id: "foo",
        userId: "ben",
        accountId: "bar",
        amount: 1000,
        cleared: "cleared",
        date: new Date(),
        payee: "foo",
        approved: false,
        memo: "foo"
      }),

      Transaction.reconstitute({
        userId: "ben",
        id: "biz",
        accountId: "bar",
        amount: 100,
        payee: "foo",
        cleared: "uncleared",
        date: new Date(),
        approved: false,
        memo: "foo"
      })
    ];

    when(mockTxRepo.getAccountTransactions)
      .calledWith("ben", "bar", 0, 30)
      .thenResolve(transactions);

    when(mockTxRepo.getAccountTransactionCount).calledWith("ben", "bar").thenResolve(4);

    const mockAccounts = mock<IAccountRepository>();
    when(mockAccounts.getAccounts).calledWith("bar").thenResolve(account);

    const service = new ListTransactionsService(mockTxRepo, mockAccounts, mock());

    const result = await service.doHandle(context);

    expect(result.transactions).toEqual(transactions);
    expect(result.count).toEqual(4);
  });

  it("throws an error if the account doesn't belong to the user", async () => {
    const mockTxRepo = mock<ITransactionRepository>();
    const mockAccounts = mock<IAccountRepository>();

    const mockUser = User.reconstitute({
      id: "ben",
      passwordHash: "foo",
      permissions: ["user"],
      email: "email"
    });

    const context = createMockServiceContext(
      "ListTransactionsCommand",
      { offset: 0, limit: 30, accountId: "bar" },
      mockUser
    );

    const account = Account.reconstitute({
      balance: 1000,
      clearedBalance: 1_000,
      unclearedBalance: 10_000,
      id: "one",
      userId: "fred",
      name: "hello",
      type: "checking",
      closed: false,
      note: "a note",
      deleted: false
    });

    when(mockAccounts.getAccounts).calledWith("bar").thenResolve(account);

    const transactions = [
      Transaction.reconstitute({
        userId: "ben",
        id: "foo",
        accountId: "bar",
        payee: "foo",
        amount: 1000,
        cleared: "cleared",
        date: new Date(),
        approved: false,
        memo: "foo"
      }),

      Transaction.reconstitute({
        userId: "ben",
        id: "biz",
        accountId: "bar",
        payee: "foo",
        amount: 100,
        cleared: "uncleared",
        date: new Date(),
        approved: false,
        memo: "foo"
      })
    ];

    when(mockTxRepo.getAccountTransactions)
      .calledWith("ben", "bar", 0, 30)
      .thenResolve(transactions);

    const service = new ListTransactionsService(mockTxRepo, mockAccounts, mock());

    await expect(service.doHandle(context)).rejects.toThrow();
  });
});
