import {
  type IAccountRepository,
  type IBankConnectionRepository,
  type IOpenBankingAccountBalanceFetcher,
} from "@ports";
import { createMockServiceContext } from "@test-helpers";
import { type ILogger } from "@ynab-plus/bootstrap";
import { mock } from "vitest-mock-extended";
import { CompareBalanceService } from "./compare-balance-service.ts";
import { when } from "vitest-when";
import { Account, BankConnection, OauthToken } from "@ynab-plus/domain";
import type { OpenBankingTokenManager } from "@services/open-banking";

describe("compare balance service", () => {
  it("returns balances match if the account cleared balance is the same as the fetcher balance", async () => {
    const mockConnectionRepo = mock<IBankConnectionRepository>();
    const mockAccountRepo = mock<IAccountRepository>();
    const mockBalanceFetcher = mock<IOpenBankingAccountBalanceFetcher>();
    const mockTokenRepo = mock<OpenBankingTokenManager>();
    const mockLogger = mock<ILogger>();

    const context = createMockServiceContext(
      "CompareBalanceCommand",
      {
        id: "account-id",
      },
      "ben",
    );

    when(mockAccountRepo.getAccounts)
      .calledWith("account-id")
      .thenResolve(
        Account.reconstitute({
          balance: 1000,
          clearedBalance: 10_000,
          unclearedBalance: 10_000,
          id: "bar-account",
          userId: "ben",
          name: "current",
          type: "checking",
          closed: true,
          note: undefined,
          linkedOpenBankingAccount: "foo",
          deleted: false,
        }),
      );

    when(mockConnectionRepo.getConnection)
      .calledWith("ben")
      .thenResolve(
        BankConnection.reconstite({
          id: "REVOLUT_REVOGB21",
          userId: "ben",
          bankName: "Revolut",
          logo: "https://storage.googleapis.com/gc-prd-institution_icons-production/UK/PNG/revolut.png",
          requisitionId: "foo",
          accounts: ["foo"],
        }),
      );

    const mockToken = mock<
      OauthToken & {
        [Symbol.asyncDispose]: () => Promise<void>;
      }
    >();
    when(mockTokenRepo.getToken).calledWith("ben").thenResolve(mockToken);

    when(mockBalanceFetcher.getAccountBalance).calledWith("foo", mockToken).thenResolve(10_000);

    const service = new CompareBalanceService(
      mockConnectionRepo,
      mockAccountRepo,
      mockBalanceFetcher,
      mockTokenRepo,
      mockLogger,
    );

    const result = await service.doHandle(context);

    expect(result.status).toEqual("balances_match");
    if (result.status === "balances_match") {
      expect(result.balance).toEqual(10_000);
    }
  });

  it("returns balance_mismatch if the account cleared balance is not the same as the fetcher balance", async () => {
    const mockConnectionRepo = mock<IBankConnectionRepository>();
    const mockAccountRepo = mock<IAccountRepository>();
    const mockBalanceFetcher = mock<IOpenBankingAccountBalanceFetcher>();
    const tokenManager = mock<OpenBankingTokenManager>();
    const mockLogger = mock<ILogger>();

    const context = createMockServiceContext(
      "CompareBalanceCommand",
      {
        id: "account-id",
      },
      "ben",
    );

    when(mockAccountRepo.getAccounts)
      .calledWith("account-id")
      .thenResolve(
        Account.reconstitute({
          balance: 1000,
          clearedBalance: 1_000,
          unclearedBalance: 10_000,
          id: "bar-account",
          userId: "ben",
          name: "current",
          type: "checking",
          closed: true,
          note: undefined,
          linkedOpenBankingAccount: "foo",
          deleted: false,
        }),
      );

    when(mockConnectionRepo.getConnection)
      .calledWith("ben")
      .thenResolve(
        BankConnection.reconstite({
          id: "REVOLUT_REVOGB21",
          userId: "ben",
          bankName: "Revolut",
          logo: "https://storage.googleapis.com/gc-prd-institution_icons-production/UK/PNG/revolut.png",
          requisitionId: "foo",
          accounts: ["foo"],
        }),
      );

    const mockToken = mock<
      OauthToken & {
        [Symbol.asyncDispose]: () => Promise<void>;
      }
    >();

    when(tokenManager.getToken).calledWith("ben").thenResolve(mockToken);

    when(mockBalanceFetcher.getAccountBalance).calledWith("foo", mockToken).thenResolve(10_000);

    const service = new CompareBalanceService(
      mockConnectionRepo,
      mockAccountRepo,
      mockBalanceFetcher,
      tokenManager,
      mockLogger,
    );

    const result = await service.doHandle(context);

    expect(result.status).toEqual("balance_mismatch");
    if (result.status === "balance_mismatch") {
      expect(result.ynabBalance).toEqual(1_000);
      expect(result.bankBalance).toEqual(10_000);
    }
  });

  it("returns no_link if the account has no linked openbanking account", async () => {
    const mockConnectionRepo = mock<IBankConnectionRepository>();
    const mockAccountRepo = mock<IAccountRepository>();
    const mockBalanceFetcher = mock<IOpenBankingAccountBalanceFetcher>();
    const mockLogger = mock<ILogger>();

    const context = createMockServiceContext(
      "CompareBalanceCommand",
      {
        id: "account-id",
      },
      "ben",
    );

    when(mockAccountRepo.getAccounts)
      .calledWith("account-id")
      .thenResolve(
        Account.reconstitute({
          balance: 1000,
          clearedBalance: 1_000,
          unclearedBalance: 10_000,
          id: "bar-account",
          userId: "ben",
          name: "current",
          type: "checking",
          closed: true,
          note: undefined,
          deleted: false,
        }),
      );

    when(mockConnectionRepo.getConnection)
      .calledWith("ben")
      .thenResolve(
        BankConnection.reconstite({
          id: "REVOLUT_REVOGB21",
          userId: "ben",
          bankName: "Revolut",
          logo: "https://storage.googleapis.com/gc-prd-institution_icons-production/UK/PNG/revolut.png",
          requisitionId: "foo",
          accounts: ["foo"],
        }),
      );

    const service = new CompareBalanceService(
      mockConnectionRepo,
      mockAccountRepo,
      mockBalanceFetcher,
      mock(),
      mockLogger,
    );

    const result = await service.doHandle(context);

    expect(result.status).toEqual("no_link");
  });

  it("returns not_connected if their is no openbanking connection", async () => {
    const mockConnectionRepo = mock<IBankConnectionRepository>();
    const mockAccountRepo = mock<IAccountRepository>();
    const mockBalanceFetcher = mock<IOpenBankingAccountBalanceFetcher>();
    const mockLogger = mock<ILogger>();

    const context = createMockServiceContext(
      "CompareBalanceCommand",
      {
        id: "account-id",
      },
      "ben",
    );

    when(mockConnectionRepo.getConnection).calledWith("ben").thenResolve(undefined);

    const service = new CompareBalanceService(
      mockConnectionRepo,
      mockAccountRepo,
      mockBalanceFetcher,
      mock(),
      mockLogger,
    );

    const result = await service.doHandle(context);

    expect(result.status).toEqual("no_bank_connection");
  });
});
