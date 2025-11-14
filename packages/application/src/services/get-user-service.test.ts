import { UserNotFoundError } from "@errors";
import type {
  ICommandMessage,
  IEventBus,
  IRepository,
  ISingleItemStore,
} from "@ports";
import { User } from "@ynab-plus/domain";
import { describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";

import { GetUserService } from "./get-user-service.ts";

describe("get user service", () => {
  it("simply returns a user, given the correct id", async () => {
    const user = new User({
      id: "ben",
      email: "a@b.c",
      passwordHash: "foo",
      permissions: ["public"],
    });

    const mockUserRepo = mock<IRepository<User>>({
      get: vi.fn(async (id: string) => {
        if (id === "ben") {
          return user;
        }

        return undefined;
      }),
    });

    const service = new GetUserService(mockUserRepo, mock());

    const command = mock<ICommandMessage<"GetUser">>({
      key: "GetUser",
      id: "foo",
      data: {
        username: "ben",
      },
    });

    const currentUserCache = mock<ISingleItemStore<User | undefined>>();
    const eventBus = mock<IEventBus>();
    const context = { command, eventBus, currentUserCache };

    const result = await service.doHandle(context);
    expect(result).toEqual(user);
  });

  it("throws an error if the user is not found", async () => {
    const mockUserRepo = mock<IRepository<User>>({
      get: vi.fn().mockResolvedValue(undefined),
    });

    const service = new GetUserService(mockUserRepo, mock());

    const command = mock<ICommandMessage<"GetUser">>({
      key: "GetUser",
      id: "foo",
      data: {
        username: "ben",
      },
    });

    const currentUserCache = mock<ISingleItemStore<User | undefined>>();
    const eventBus = mock<IEventBus>();
    const context = { command, eventBus, currentUserCache };

    await expect(service.doHandle(context)).rejects.toThrow(UserNotFoundError);
  });
});
