import { AppError } from "@errors";
import { expect } from "vitest";
import { type ITaskScheduler, type IAccountRepository, type IAccountsFetcher } from "@ports";
import { createMockServiceContext } from "@test-helpers";
import { Account, OauthToken, RegularTask, SystemContext, User } from "@ynab-plus/domain";
import { mock } from "vitest-mock-extended";
import { when } from "vitest-when";

import { SyncAccountsService } from "./sync-accounts-service.ts";
import type { OauthTokenManager } from "@services/oauth";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("download-accounts service", () => {
  it("throws an error if executed in a system context without an onBehalfOf", async () => {
    const context = createMockServiceContext(
      "SyncAccountsCommand",
      { force: true },
      new SystemContext("test", ["system"])
    );

    const service = new SyncAccountsService(mock(), mock(), mock(), mock(), mock());

    await expect(service.doHandle(context)).rejects.toThrow(AppError);
  });

  it("works if execution is delegated by the system to a user", async () => {
    vi.setSystemTime(new Date("2025-11-15T11:08:50.571Z"));

    const user = User.reconstitute({
      id: "ben",
      email: "a@b.c",
      passwordHash: "foo",
      permissions: ["admin"]
    });

    const lastUse = new Date("2025-11-15T11:07:50.571Z");

    const token = mock<
      OauthToken & {
        [Symbol.asyncDispose]: () => Promise<void>;
      }
    >({
      lastUse
    });

    const mockTokenRepo = mock<OauthTokenManager>();

    when(mockTokenRepo.getToken).calledWith("ben", "ynab").thenResolve(token);

    const mockFetcher = mock<IAccountsFetcher>();

    const accounts = [
      Account.reconstitute({
        balance: 1000,
        clearedBalance: 1_000,
        unclearedBalance: 10_000,
        id: "foo-account",
        userId: "ben",
        name: "current",
        type: "checking",
        closed: true,
        note: "hello",
        deleted: false
      }),
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
        deleted: false
      })
    ];

    when(mockFetcher.getAccounts).calledWith(token).thenResolve(accounts);

    const mockAccountsRepo = mock<IAccountRepository>();

    when(mockAccountsRepo.getUserAccounts).calledWith("ben").thenResolve(accounts);

    const service = new SyncAccountsService(
      mockTokenRepo,
      mockFetcher,
      mockAccountsRepo,
      mock(),
      mock()
    );

    const context = createMockServiceContext(
      "SyncAccountsCommand",
      { force: true },
      new SystemContext("test", ["admin"], user)
    );

    const result = await service.doHandle(context);

    expect(mockAccountsRepo.saveAccounts).toHaveBeenCalledWith(accounts);
    expect(result.synced).toEqual(true);
  });

  it("creates a download task for each new account", async () => {
    const today = new Date("2025-11-22T11:07:50.571Z");

    vi.setSystemTime(today);

    const user = User.reconstitute({
      id: "ben",
      email: "a@b.c",
      passwordHash: "foo",
      permissions: ["admin"]
    });

    const lastUse = new Date("2025-11-15T11:07:50.571Z");

    const token = mock<
      OauthToken & {
        [Symbol.asyncDispose]: () => Promise<void>;
      }
    >({
      lastUse
    });

    const mockTokenRepo = mock<OauthTokenManager>();

    when(mockTokenRepo.getToken).calledWith("ben", "ynab").thenResolve(token);

    const mockFetcher = mock<IAccountsFetcher>();

    const fetchedAccounts = [
      Account.reconstitute({
        balance: 1000,
        clearedBalance: 1_000,
        unclearedBalance: 10_000,
        id: "foo-account",
        userId: "ben",
        name: "current",
        type: "checking",
        closed: true,
        note: "hello",
        deleted: false
      }),
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
        deleted: false
      }),
      Account.reconstitute({
        balance: 1000,
        clearedBalance: 1_000,
        unclearedBalance: 10_000,
        id: "baz-account",
        userId: "ben",
        name: "current",
        type: "checking",
        closed: true,
        note: undefined,
        deleted: false
      }),
      Account.reconstitute({
        balance: 1000,
        clearedBalance: 1_000,
        unclearedBalance: 10_000,
        id: "bip-account",
        userId: "ben",
        name: "current",
        type: "checking",
        closed: true,
        note: undefined,
        deleted: false
      })
    ];

    const storedAccounts = [
      Account.reconstitute({
        balance: 1000,
        clearedBalance: 1_000,
        unclearedBalance: 10_000,
        id: "foo-account",
        userId: "ben",
        name: "current",
        type: "checking",
        closed: true,
        note: "hello",
        deleted: false
      }),
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
        deleted: false
      })
    ];

    const mockAccountsRepo = mock<IAccountRepository>();

    when(mockFetcher.getAccounts).calledWith(token).thenResolve(fetchedAccounts);

    when(mockAccountsRepo.getUserAccounts).calledWith("ben").thenResolve(storedAccounts);

    const mockTaskScheduler = mock<ITaskScheduler>();

    const service = new SyncAccountsService(
      mockTokenRepo,
      mockFetcher,
      mockAccountsRepo,
      mockTaskScheduler,
      mock()
    );

    const context = createMockServiceContext("SyncAccountsCommand", { force: true }, user);

    await service.doHandle(context);

    expect(mockTaskScheduler.scheduleTask).toHaveBeenCalledTimes(2);

    const taskOne = RegularTask.reconstitute({
      id: "ben-bip-account-tx-sync",
      onBehalfOf: "ben",
      triggerImmediately: true,
      created: today,
      lastExecution: undefined,
      minute: "*/10",
      hour: "*",
      data: '{ "id":"bip-account" }',
      day: "*",
      month: "*",
      weekDay: "*",
      name: "Download transactions",
      description: "Keeps account transactions in sync",
      command: "SyncAccountCommand"
    });

    const taskTwo = RegularTask.reconstitute({
      id: "ben-baz-account-tx-sync",
      onBehalfOf: "ben",
      triggerImmediately: true,
      created: today,
      lastExecution: undefined,
      minute: "*/10",
      hour: "*",
      data: '{ "id":"baz-account" }',
      day: "*",
      month: "*",
      weekDay: "*",
      name: "Download transactions",
      description: "Keeps account transactions in sync",
      command: "SyncAccountCommand"
    });

    expect(mockTaskScheduler.scheduleTask).toHaveBeenCalledWith(taskOne);
    expect(mockTaskScheduler.scheduleTask).toHaveBeenCalledWith(taskTwo);
  });

  it("downloads accounts from the fetcher and stores them in the repo using the current users ynab token when token was ", async () => {
    vi.setSystemTime(new Date("2025-11-15T11:08:50.571Z"));

    const user = User.reconstitute({
      id: "ben",
      email: "a@b.c",
      passwordHash: "foo",
      permissions: ["admin"]
    });

    const lastUse = new Date("2025-11-15T11:07:50.571Z");

    const token = mock<
      OauthToken & {
        [Symbol.asyncDispose]: () => Promise<void>;
      }
    >({ lastUse });

    const mockTokenManager = mock<OauthTokenManager>();

    when(mockTokenManager.getToken).calledWith("ben", "ynab").thenResolve(token);

    const mockFetcher = mock<IAccountsFetcher>();

    const accounts = [
      Account.reconstitute({
        balance: 1000,
        clearedBalance: 1_000,
        unclearedBalance: 10_000,
        id: "foo-account",
        userId: "ben",
        name: "current",
        type: "checking",
        closed: true,
        note: "hello",
        deleted: false
      }),
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
        deleted: false
      })
    ];

    when(mockFetcher.getAccounts).calledWith(token).thenResolve(accounts);

    const mockAccountsRepo = mock<IAccountRepository>();

    when(mockAccountsRepo.getUserAccounts).calledWith("ben").thenResolve(accounts);

    const service = new SyncAccountsService(
      mockTokenManager,
      mockFetcher,
      mockAccountsRepo,
      mock(),
      mock()
    );

    const context = createMockServiceContext("SyncAccountsCommand", { force: true }, user);

    const result = await service.doHandle(context);

    expect(mockAccountsRepo.saveAccounts).toHaveBeenCalledWith(accounts);
    expect(result.synced).toEqual(true);
  });

  it("does no syncing if token is less then 10 minutes old and force is off", async () => {
    vi.setSystemTime(new Date("2025-11-15T11:08:50.571Z"));

    const user = User.reconstitute({
      id: "ben",
      email: "a@b.c",
      passwordHash: "foo",
      permissions: ["admin"]
    });

    const lastUse = new Date("2025-11-15T11:07:50.571Z");

    const token = mock<
      OauthToken & {
        [Symbol.asyncDispose]: () => Promise<void>;
      }
    >({ lastUse });

    const mockTokenRepo = mock<OauthTokenManager>();

    when(mockTokenRepo.getToken).calledWith("ben", "ynab").thenResolve(token);

    const mockFetcher = mock<IAccountsFetcher>();

    const mockAccountsRepo = mock<IAccountRepository>();

    const service = new SyncAccountsService(
      mockTokenRepo,
      mockFetcher,
      mockAccountsRepo,
      mock(),
      mock()
    );

    const context = createMockServiceContext("SyncAccountsCommand", { force: false }, user);

    await service.doHandle(context);

    const result = await service.doHandle(context);

    expect(mockFetcher.getAccounts).not.toHaveBeenCalled();
    expect(mockAccountsRepo.saveAccounts).not.toHaveBeenCalled();
    expect(result.synced).toEqual(false);
  });

  it("downloads accounts from the fetcher and stores them in the repo using the current users ynab token so long as the token was used more than 5 minutes ago when force is off", async () => {
    vi.setSystemTime(new Date("2025-11-15T12:08:50.571Z"));

    const user = User.reconstitute({
      id: "ben",
      email: "a@b.c",
      passwordHash: "foo",
      permissions: ["admin"]
    });

    const lastUse = new Date("2025-11-15T11:07:50.571Z");

    const token = mock<
      OauthToken & {
        [Symbol.asyncDispose]: () => Promise<void>;
      }
    >({ lastUse });

    const oauthTokenManager = mock<OauthTokenManager>();

    when(oauthTokenManager.getToken).calledWith("ben", "ynab").thenResolve(token);

    const mockFetcher = mock<IAccountsFetcher>();

    const accounts = [
      Account.reconstitute({
        balance: 1000,
        clearedBalance: 1_000,
        unclearedBalance: 10_000,
        id: "foo-account",
        userId: "ben",
        name: "current",
        type: "checking",
        closed: true,
        note: "hello",
        deleted: false
      }),
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
        deleted: false
      })
    ];

    when(mockFetcher.getAccounts).calledWith(token).thenResolve(accounts);

    const mockAccountsRepo = mock<IAccountRepository>();

    when(mockAccountsRepo.getUserAccounts).calledWith("ben").thenResolve(accounts);

    const service = new SyncAccountsService(
      oauthTokenManager,
      mockFetcher,
      mockAccountsRepo,
      mock(),
      mock()
    );

    const context = createMockServiceContext("SyncAccountsCommand", { force: false }, user);

    await service.doHandle(context);

    const result = await service.doHandle(context);

    expect(mockAccountsRepo.saveAccounts).toHaveBeenCalledWith(accounts);
    expect(result.synced).toEqual(true);
  });

  it("downloads accounts from the fetcher and stores them in the repo using the current users ynab token if its not been used and force is off", async () => {
    vi.setSystemTime(new Date("2025-11-15T12:08:50.571Z"));

    const user = User.reconstitute({
      id: "ben",
      email: "a@b.c",
      passwordHash: "foo",
      permissions: ["admin"]
    });

    const token = mock<
      OauthToken & {
        [Symbol.asyncDispose]: () => Promise<void>;
      }
    >({ lastUse: undefined });

    const mockTokenManager = mock<OauthTokenManager>();

    when(mockTokenManager.getToken).calledWith("ben", "ynab").thenResolve(token);

    const mockFetcher = mock<IAccountsFetcher>();

    const accounts = [
      Account.reconstitute({
        balance: 1000,
        clearedBalance: 1_000,
        unclearedBalance: 10_000,
        id: "foo-account",
        userId: "ben",
        name: "current",
        type: "checking",
        closed: true,
        note: "hello",
        deleted: false
      }),
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
        deleted: false
      })
    ];

    when(mockFetcher.getAccounts).calledWith(token).thenResolve(accounts);

    const mockAccountsRepo = mock<IAccountRepository>();

    when(mockAccountsRepo.getUserAccounts).calledWith("ben").thenResolve(accounts);

    const service = new SyncAccountsService(
      mockTokenManager,
      mockFetcher,
      mockAccountsRepo,
      mock(),
      mock()
    );

    const context = createMockServiceContext("SyncAccountsCommand", { force: false }, user);

    await service.doHandle(context);

    const result = await service.doHandle(context);

    const { eventBus } = context;

    expect(mockAccountsRepo.saveAccounts).toHaveBeenCalledWith(accounts);
    expect(result.synced).toEqual(true);
    expect(eventBus.emit).toHaveBeenCalledWith("AccountsSynced", accounts);
  });
});
