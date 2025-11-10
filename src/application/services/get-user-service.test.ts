import { describe, it, mock as bunMock, expect } from "bun:test";
import { mock } from "bun-mock-extended";
import { GetUserService } from "./get-user-service.ts";
import type { IRepository } from "../ports/i-repository.ts";
import { User } from "@domain";
import type { ICommandMessage, IEventBus } from "@application";
import type { ISingleItemStore } from "../ports/i-single-item-store.ts";
import { UserNotFoundError } from "../errors/user-not-found-error.ts";

describe("get user service", () => {
  it("simply returns a user, given the correct id", async () => {
    const user = new User({
      id: "ben",
      email: "a@b.c",
      passwordHash: "foo",
      permissions: ["public"],
    });

    const mockUserRepo = mock<IRepository<User>>({
      get: bunMock(async (id: string) => {
        if (id === "ben") {
          return user;
        }

        return undefined;
      }),
    });

    const service = new GetUserService(mockUserRepo);

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
      get: bunMock().mockResolvedValue(undefined),
    });

    const service = new GetUserService(mockUserRepo);

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

    expect(service.doHandle(context)).rejects.toThrow(UserNotFoundError);
  });
});
