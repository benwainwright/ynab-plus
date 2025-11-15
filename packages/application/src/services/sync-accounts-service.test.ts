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

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("download-accounts service", () => {
  it("downloads accounts from the fetcher and stores them in the repo using the current users ynab token when token was used recently when force is true", async () => {
    vi.setSystemTime(new Date("2025-11-15T11:08:50.571Z"));

    const user = new User({
      id: "ben",
      email: "a@b.c",
      passwordHash: "foo",
      permissions: ["admin"],
    });

    const lastUse = new Date("2025-11-15T11:07:50.571Z");

    const token = new OauthToken({
      expiry: new Date(),
      created: new Date(),
      refreshed: new Date(),
      lastUse,
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
      { force: true },
      user,
    );

    const result = await service.doHandle(context);

    expect(mockAccountsRepo.saveAccounts).toHaveBeenCalledWith(accounts);
    expect(result.synced).toEqual(true);
  });

  it("does no syncing if token is less then 10 minutes old and force is off", async () => {
    vi.setSystemTime(new Date("2025-11-15T11:08:50.571Z"));

    const user = new User({
      id: "ben",
      email: "a@b.c",
      passwordHash: "foo",
      permissions: ["admin"],
    });

    const lastUse = new Date("2025-11-15T11:07:50.571Z");

    const token = new OauthToken({
      expiry: new Date(),
      created: new Date(),
      refreshed: new Date(),
      lastUse,
      token: "token",
      refreshToken: "refresh",
      provider: "ynab",
      userId: "ben",
    });

    const mockTokenRepo = mock<IOauthTokenRepository>();

    when(mockTokenRepo.get).calledWith("ben", "ynab").thenResolve(token);

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
      { force: false },
      user,
    );

    await service.doHandle(context);

    const result = await service.doHandle(context);

    expect(mockFetcher.getAccounts).not.toHaveBeenCalled();
    expect(mockAccountsRepo.saveAccounts).not.toHaveBeenCalled();
    expect(result.synced).toEqual(false);
  });

  it("downloads accounts from the fetcher and stores them in the repo using the current users ynab token so long as the token was used more than 5 minutes ago when force is off", async () => {
    vi.setSystemTime(new Date("2025-11-15T12:08:50.571Z"));

    const user = new User({
      id: "ben",
      email: "a@b.c",
      passwordHash: "foo",
      permissions: ["admin"],
    });

    const lastUse = new Date("2025-11-15T11:07:50.571Z");

    const token = new OauthToken({
      expiry: new Date(),
      created: new Date(),
      refreshed: new Date(),
      lastUse,
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
      { force: false },
      user,
    );

    await service.doHandle(context);

    const result = await service.doHandle(context);

    expect(mockAccountsRepo.saveAccounts).toHaveBeenCalledWith(accounts);
    expect(result.synced).toEqual(true);
    expect(mockTokenRepo.save).toHaveBeenCalledWith(token);
  });

  it("downloads accounts from the fetcher and stores them in the repo using the current users ynab token if its not been used and force is off", async () => {
    vi.setSystemTime(new Date("2025-11-15T12:08:50.571Z"));

    const user = new User({
      id: "ben",
      email: "a@b.c",
      passwordHash: "foo",
      permissions: ["admin"],
    });

    const token = new OauthToken({
      expiry: new Date(),
      created: new Date(),
      refreshed: new Date(),
      lastUse: undefined,
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
      { force: false },
      user,
    );

    await service.doHandle(context);

    const result = await service.doHandle(context);

    const { eventBus } = context;

    expect(mockAccountsRepo.saveAccounts).toHaveBeenCalledWith(accounts);
    expect(result.synced).toEqual(true);
    expect(mockTokenRepo.save).toHaveBeenCalledWith(token);
    expect(eventBus.emit).toHaveBeenCalledWith("AccountsSynced", accounts);
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
      { force: true },
      user,
    );

    await expect(service.doHandle(context)).rejects.toThrow(AppError);
  });
});
