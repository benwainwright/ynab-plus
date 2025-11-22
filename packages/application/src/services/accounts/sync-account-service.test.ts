import { mock } from "vitest-mock-extended";
import { SyncAccountService } from "./sync-account-service.ts";
import {
  type ITransactionFetcher,
  type IOauthTokenRepository,
  type IRepository,
  type ITransactionRepository,
} from "@ports";
import {
  OauthToken,
  SyncDetails,
  SystemContext,
  Transaction,
  User,
} from "@ynab-plus/domain";
import { createMockServiceContext } from "@test-helpers";
import { when } from "vitest-when";

describe("sync account service", () => {
  it("returns false if there is no token", async () => {
    const syncDetailsRepo = mock<IRepository<SyncDetails>>();
    const tokenRepo = mock<IOauthTokenRepository>();
    const fetcher = mock<ITransactionFetcher>();
    const txRepo = mock<ITransactionRepository>();

    const service = new SyncAccountService(
      syncDetailsRepo,
      tokenRepo,
      fetcher,
      txRepo,
      mock(),
    );

    const user = User.reconstitute({
      email: "bwainwright28@gmail.com",
      id: "ben",
      passwordHash:
        "$argon2id$v=19$m=65536,t=2,p=1$n7G8BcbQsFanGrlBuFB/Y7dedcifW3P7brW8tyMwLsU$9Zdmy6ccSH6ABRNiP6SU+qKE0oYdqu5eexecCKyMDdk",
      permissions: ["user", "public"],
    });

    const context = createMockServiceContext(
      "SyncAccountCommand",
      {
        id: "the-id",
      },
      new SystemContext("scheduler", ["system"], user),
    );

    const newDetails = SyncDetails.reconstitute({
      id: "ynab-account-sync-the-id",
      provider: "ynab",
      checkpoint: "blah",
      lastSync: new Date("2025-12-10T20:39:37.823Z"),
    });

    when(syncDetailsRepo.get)
      .calledWith(`ynab-account-sync-the-id`)
      .thenResolve(newDetails);

    when(tokenRepo.get).calledWith(`ben`, `ynab`).thenResolve(undefined);

    const result = await service.doHandle(context);
    expect(result.success).toEqual(false);
  });

  it("gets the sync details and token from repos, passes them to the fetcher, gets back transactions and saves them in the tx repo, then saves the sync details", async () => {
    const syncDetailsRepo = mock<IRepository<SyncDetails>>();
    const tokenRepo = mock<IOauthTokenRepository>();
    const fetcher = mock<ITransactionFetcher>();
    const txRepo = mock<ITransactionRepository>();

    const service = new SyncAccountService(
      syncDetailsRepo,
      tokenRepo,
      fetcher,
      txRepo,
      mock(),
    );

    const user = User.reconstitute({
      email: "bwainwright28@gmail.com",
      id: "ben",
      passwordHash:
        "$argon2id$v=19$m=65536,t=2,p=1$n7G8BcbQsFanGrlBuFB/Y7dedcifW3P7brW8tyMwLsU$9Zdmy6ccSH6ABRNiP6SU+qKE0oYdqu5eexecCKyMDdk",
      permissions: ["user", "public"],
    });

    const context = createMockServiceContext(
      "SyncAccountCommand",
      {
        id: "the-id",
      },
      new SystemContext("scheduler", ["system"], user),
    );

    const newDetails = SyncDetails.reconstitute({
      id: "ynab-account-sync-the-id",
      provider: "ynab",
      checkpoint: "blah",
      lastSync: new Date("2025-12-10T20:39:37.823Z"),
    });

    const token = OauthToken.reconstitute({
      provider: "ynab",
      expiry: new Date("2025-12-11T20:39:37.823Z"),
      token: "foo",
      userId: "ben",
      refreshToken: "bar",
      lastUse: new Date("2025-12-10T20:39:37.823Z"),
      refreshed: new Date("2025-07-10T20:39:37.823Z"),
      created: new Date("2025-05-10T20:39:37.823Z"),
    });

    when(syncDetailsRepo.get)
      .calledWith(`ynab-account-sync-the-id`)
      .thenResolve(newDetails);

    when(tokenRepo.get).calledWith(`ben`, `ynab`).thenResolve(token);

    const dummyTransactions = [
      Transaction.reconstitute({
        id: "tx-001",
        payee: "foo",
        accountId: "the-id",
        date: new Date("2024-11-10T10:15:00Z"),
        amount: -4500,
        cleared: "cleared",
        approved: true,
        memo: "Groceries - Tesco",
      }),
      Transaction.reconstitute({
        id: "tx-002",
        payee: "foo",
        accountId: "the-id",
        date: new Date("2024-11-11T09:00:00Z"),
        amount: -1299,
        cleared: "cleared",
        approved: true,
        memo: "Coffee and breakfast",
      }),
      Transaction.reconstitute({
        id: "tx-003",
        accountId: "the-id",
        date: new Date("2024-11-12T20:45:00Z"),
        payee: "bar",
        amount: 250000,
        cleared: "cleared",
        approved: true,
        memo: "Salary",
      }),
      Transaction.reconstitute({
        id: "tx-004",
        accountId: "the-id",
        payee: "none",
        date: new Date("2024-11-13T14:10:00Z"),
        amount: -799,
        cleared: "cleared",
        approved: false,
        memo: "Spotify subscription",
      }),
      Transaction.reconstitute({
        id: "tx-005",
        payee: "none",
        accountId: "the-id",
        date: new Date("2024-11-14T18:03:00Z"),
        amount: -3250,
        cleared: "cleared",
        approved: false,
        memo: "Dinner with friends",
      }),
    ];

    when(fetcher.getAccountTransactions)
      .calledWith(token, "the-id", newDetails)
      .thenResolve(dummyTransactions);

    const result = await service.doHandle(context);

    expect(txRepo.saveTransactions).toHaveBeenCalledWith(dummyTransactions);

    expect(syncDetailsRepo.save).toHaveBeenCalledWith(newDetails);
    expect(result.success).toEqual(true);
  });
});
