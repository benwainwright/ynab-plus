import type { IRepository } from "@ports";
import { createMockServiceContext } from "@test-helpers";
import { User } from "@ynab-plus/domain";
import { mock } from "vitest-mock-extended";
import { when } from "vitest-when";

import { ListUsersService } from "./list-users-service.ts";

describe("list users service", () => {
  it("returns a list of all the users, passing through the offset and limit", async () => {
    const mockUser = mock<User>({
      id: "ben",
      passwordHash: "foo",
      permissions: ["admin"],
      email: "email",
    });

    const mockUserList = [
      mock<User>({
        id: "ben-2",
        passwordHash: "foo",
        permissions: ["admin"],
        email: "email",
      }),
      mock<User>({
        id: "ben-2",
        passwordHash: "foo",
        permissions: ["admin"],
        email: "email",
      }),
    ];

    const context = createMockServiceContext(
      "ListUsersCommand",
      { offset: 0, limit: 10 },
      mockUser,
    );

    const repo = mock<IRepository<User>>();

    when(repo.getMany).calledWith(0, 10).thenResolve(mockUserList);

    const service = new ListUsersService(repo, mock());

    const result = await service.doHandle(context);

    expect(result).toEqual(mockUserList);
  });
});
