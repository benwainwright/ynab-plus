import { describe, it, mock as bunMock, expect } from "bun:test";

import { GetCurrentUserService } from "./get-current-user-service.ts";
import { mock } from "bun-mock-extended";

import { AppError } from "@errors";

import type {
  ICommandMessage,
  IEventBus,
  IRepository,
  ISingleItemStore,
} from "../ports/index.ts";
import { User } from "@domain";

describe("get user command handler", () => {
  it("gets a user from the repository and returns it", async () => {
    const mockUser = mock<User>({
      id: "ben",
      passwordHash: "foo",
      permissions: ["admin"],
      email: "email",
    });

    const repo = mock<IRepository<User>>({
      get: bunMock(async (id: string) => {
        if (id === "ben") {
          return mockUser;
        }
        return undefined;
      }),
    });

    const handler = new GetCurrentUserService(repo);

    const command = mock<ICommandMessage<"GetCurrentUserCommand">>({
      key: "GetCurrentUserCommand",
      id: "foo",
    });

    const eventBus = mock<IEventBus>();

    const currentUserCache = mock<ISingleItemStore<User>>({
      get: bunMock().mockResolvedValue({
        id: "ben",
        permissions: ["admin"],
        email: "bwainwright28@gmail.com",
        passwordHash: "foo",
      }),
    });

    const context = { command, eventBus, currentUserCache };

    const response = await handler.doHandle(context);

    expect(response).toEqual(mockUser);
  });

  it("returns undefined if there is no logged in user", async () => {
    const mockUser = new User({
      id: "ben",
      passwordHash: "foo",
      permissions: ["admin"],
      email: "email",
    });

    const repo = mock<IRepository<User>>({
      get: bunMock(async (id: string) => {
        if (id === "ben") {
          return mockUser;
        }
        return undefined;
      }),
    });

    const handler = new GetCurrentUserService(repo);

    const command = mock<ICommandMessage<"GetCurrentUserCommand">>({
      key: "GetCurrentUserCommand",
      id: "foo",
    });

    const eventBus = mock<IEventBus>();

    const currentUserCache = mock<ISingleItemStore<User>>({
      get: bunMock().mockResolvedValue({
        userId: undefined,
        permissions: undefined,
      }),
    });

    const context = { command, eventBus, currentUserCache };

    const response = await handler.doHandle(context);

    expect(response).toEqual(undefined);
  });

  it("updates session with permissions if they've changed", async () => {
    const mockUser = new User({
      id: "ben",
      passwordHash: "foo",
      permissions: ["user"],
      email: "email",
    });

    const repo = mock<IRepository<User>>({
      get: bunMock(async (id: string) => {
        if (id === "ben") {
          return mockUser;
        }
        return undefined;
      }),
    });

    const handler = new GetCurrentUserService(repo);

    const command = mock<ICommandMessage<"GetCurrentUserCommand">>({
      key: "GetCurrentUserCommand",
      id: "foo",
    });

    const eventBus = mock<IEventBus>();

    const currentUserCache = mock<ISingleItemStore<User>>({
      get: bunMock().mockResolvedValue(
        new User({
          id: "ben",
          permissions: ["admin"],
          email: "bwainwright28@gmail.com",
          passwordHash: "foo",
        }),
      ),
    });

    const context = { command, eventBus, currentUserCache };

    await handler.doHandle(context);

    expect(currentUserCache.set).toHaveBeenCalledWith({
      id: "ben",
      permissions: ["user"],
      email: "bwainwright28@gmail.com",
      passwordHash: "foo",
    });
  });

  it("throws an error if the logged in user does not exist in the database", async () => {
    const repo = mock<IRepository<User>>({
      get: bunMock().mockResolvedValue(undefined),
    });

    const handler = new GetCurrentUserService(repo);

    const command = mock<ICommandMessage<"GetCurrentUserCommand">>({
      key: "GetCurrentUserCommand",
      id: "foo",
    });

    const eventBus = mock<IEventBus>();

    const currentUserCache = mock<ISingleItemStore<User>>({
      get: bunMock().mockResolvedValue(
        mock<User>({
          id: "ben",
          permissions: ["admin"],
          email: "bwainwright28@gmail.com",
          passwordHash: "foo",
        }),
      ),
    });

    const context = { command, eventBus, currentUserCache };

    await expect(handler.doHandle(context)).rejects.toThrow(AppError);
  });
});
