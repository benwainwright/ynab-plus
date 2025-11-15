import { AppError } from "@errors";
import {
  type IAccountRepository,
  type IAccountsFetcher,
  type IOauthTokenRepository,
} from "@ports";
import { createMockServiceContext } from "@test-helpers";
import { Account, OauthToken, User } from "@ynab-plus/domain";
import { mock } from "vitest-mock-extended";
import { when } from "vitest-when";

import { SyncAccountsService } from "./sync-accounts-service.ts";

describe("download-accounts service", () => {
  it("downloads accounts from the fetcher and stores them in the repo using the current users ynab token", async () => {
    const user = new User({
      id: "ben",
      email: "a@b.c",
      passwordHash: "foo",
      permissions: ["admin"],
    });

    const token = new OauthToken({
      expiry: new Date(),
      token: "token",
      refreshToken: "refresh",
      provider: "ynab",
      userId: "ben",
    });

    const mockTokenRepo = mock<IOauthTokenRepository>();

    when(mockTokenRepo.get).calledWith("ben", "ynab").thenResolve(token);

    const mockFetcher = mock<IAccountsFetcher>();

    const accounts = [
      new Account({
        id: "foo-account",
        userId: "ben",
        name: "current",
        type: "checking",
        closed: true,
        note: "hello",
        deleted: false,
      }),
      new Account({
        id: "bar-account",
        userId: "ben",
        name: "current",
        type: "checking",
        closed: true,
        note: undefined,
        deleted: false,
      }),
    ];

    when(mockFetcher.getAccounts).calledWith(token).thenResolve(accounts);

    const mockAccountsRepo = mock<IAccountRepository>();

    const service = new SyncAccountsService(
      mockTokenRepo,
      mockFetcher,
      mockAccountsRepo,
      mock(),
    );

    const context = createMockServiceContext(
      "SyncAccountsCommand",
      undefined,
      user,
    );

    await service.doHandle(context);

    expect(mockAccountsRepo.saveAccounts).toHaveBeenCalledWith(accounts);
  });

  it("throws an error if there is no token", async () => {
    const user = new User({
      id: "ben",
      email: "a@b.c",
      passwordHash: "foo",
      permissions: ["admin"],
    });

    const mockTokenRepo = mock<IOauthTokenRepository>();

    when(mockTokenRepo.get).calledWith("ben", "ynab").thenResolve(undefined);

    const mockFetcher = mock<IAccountsFetcher>();

    const mockAccountsRepo = mock<IAccountRepository>();

    const service = new SyncAccountsService(
      mockTokenRepo,
      mockFetcher,
      mockAccountsRepo,
      mock(),
    );

    const context = createMockServiceContext(
      "SyncAccountsCommand",
      undefined,
      user,
    );

    await expect(service.doHandle(context)).rejects.toThrow(AppError);
  });
});
