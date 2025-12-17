import type { IMultipleRepository, IRepository } from "@ports";
import { User } from "@ynab-plus/domain";
import { describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";

import { GetUsersService } from "./get-users-service.ts";
import { createMockServiceContext } from "@test-helpers";

describe("get users service", () => {
  it("simply returns a user, given the correct id", async () => {
    const user1 = User.reconstitute({
      id: "ben",
      email: "a@b.c",
      passwordHash: "foo",
      permissions: ["public"]
    });

    const user2 = User.reconstitute({
      id: "ben2",
      email: "a@b.c",
      passwordHash: "foo",
      permissions: ["public"]
    });

    const mockUserRepo = mock<IRepository<User> & IMultipleRepository<User>>({
      get: vi.fn(async (id: string) => {
        if (id === "ben") {
          return Promise.resolve(user1);
        }

        if (id === "ben2") {
          return Promise.resolve(user2);
        }

        return Promise.resolve(undefined);
      })
    });

    const service = new GetUsersService(mockUserRepo, mock());

    const context = createMockServiceContext("GetUsersCommand", {
      usernames: ["ben", "ben2"]
    });

    const result = await service.doHandle(context);
    expect(result).toEqual([user1, user2]);
  });
});
