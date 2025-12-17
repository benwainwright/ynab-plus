import type { IAccountRepository } from "@ports";
import { createMockServiceContext } from "@test-helpers";
import { Account, SystemContext, User } from "@ynab-plus/domain";
import { mock } from "vitest-mock-extended";
import { when } from "vitest-when";

import { ListAccountsService } from "./list-accounts-service.ts";
import { AppError } from "@errors";

describe("list accounts service", () => {
  it("throws an error if executed in a system context without an onBehalfOf", async () => {
    const context = createMockServiceContext(
      "ListAccountsCommand",
      undefined,
      new SystemContext("test", ["system"])
    );

    const service = new ListAccountsService(mock(), mock());

    await expect(service.doHandle(context)).rejects.toThrow(AppError);
  });

  it("correctly returns users if the system context has a user attached", async () => {
    const mockUser = User.reconstitute({
      id: "ben",
      passwordHash: "foo",
      permissions: ["user"],
      email: "email"
    });

    const mockUserList = [
      Account.reconstitute({
        id: "foo-account",
        userId: "ben",
        name: "current",
        type: "checking",
        closed: true,
        note: "hello",
        balance: 1000,
        clearedBalance: 1_000,
        unclearedBalance: 10_000,
        deleted: false
      }),
      Account.reconstitute({
        id: "bar-account",
        userId: "ben",
        name: "current",
        type: "checking",
        balance: 1000,
        clearedBalance: 1_000,
        unclearedBalance: 10_000,
        closed: true,
        note: undefined,
        deleted: false
      })
    ];

    const context = createMockServiceContext(
      "ListAccountsCommand",
      undefined,
      new SystemContext("test", ["user"], mockUser)
    );

    const repo = mock<IAccountRepository>();

    when(repo.getUserAccounts).calledWith(mockUser.id).thenResolve(mockUserList);

    const service = new ListAccountsService(repo, mock());

    const result = await service.doHandle(context);

    expect(result).toEqual(mockUserList);
  });

  it("returns a list of all the accounts, passing through the offset and limit", async () => {
    const mockUser = User.reconstitute({
      id: "ben",
      passwordHash: "foo",
      permissions: ["user"],
      email: "email"
    });

    const mockUserList = [
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

    const context = createMockServiceContext("ListAccountsCommand", undefined, mockUser);

    const repo = mock<IAccountRepository>();

    when(repo.getUserAccounts).calledWith(mockUser.id).thenResolve(mockUserList);

    const service = new ListAccountsService(repo, mock());

    const result = await service.doHandle(context);

    expect(result).toEqual(mockUserList);
  });
});
