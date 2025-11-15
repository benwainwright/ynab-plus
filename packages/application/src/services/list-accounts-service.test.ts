import type { IAccountRepository } from "@ports";
import { createMockServiceContext } from "@test-helpers";
import { Account, User } from "@ynab-plus/domain";
import { mock } from "vitest-mock-extended";
import { when } from "vitest-when";

import { ListAccountsService } from "./list-accounts-service.ts";

describe("list accounts service", () => {
  it("returns a list of all the accounts, passing through the offset and limit", async () => {
    const mockUser = mock<User>({
      id: "ben",
      passwordHash: "foo",
      permissions: ["user"],
      email: "email",
    });

    const mockUserList = [
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

    const context = createMockServiceContext(
      "ListAccountsCommand",
      undefined,
      mockUser,
    );

    const repo = mock<IAccountRepository>();

    when(repo.getUserAccounts)
      .calledWith(mockUser.id)
      .thenResolve(mockUserList);

    const service = new ListAccountsService(repo, mock());

    const result = await service.doHandle(context);

    expect(result).toEqual(mockUserList);
  });
});
