import { describe, it, mock as bunMock, expect } from "bun:test";
import { GetCurrentUserCommandHandler } from "./get-current-user-command-handler.ts";
import { mock } from "bun-mock-extended";
import {
  type IRepository,
  type IUser,
  type ICommandMessage,
  type IEventBus,
  type ISessionData,
  type IStore,
} from "@types";
import { AppError } from "@errors";

describe("get user command handler", () => {
  it("gets a user from the repository and returns it", async () => {
    const mockUser: IUser = {
      id: "ben",
      passwordHash: "foo",
      permissions: ["admin"],
      email: "email",
    };

    const repo = mock<IRepository<IUser>>({
      get: bunMock(async (id: string) => {
        if (id === "ben") {
          return mockUser;
        }
        return undefined;
      }),
    });

    const handler = new GetCurrentUserCommandHandler(repo);

    const command = mock<ICommandMessage<"GetCurrentUserCommand">>({
      key: "GetCurrentUserCommand",
      id: "foo",
    });

    const eventBus = mock<IEventBus>();

    const session = mock<IStore<ISessionData>>({
      get: bunMock().mockResolvedValue({
        userId: "ben",
        permissions: ["admin"],
      }),
    });

    const context = { command, eventBus, session };

    await handler.doHandle(context);

    expect(eventBus.emit).toHaveBeenCalledWith("CommandResponse", {
      key: "GetCurrentUserCommand",
      data: mockUser,
      id: "foo",
    });
  });

  it("returns undefined if there is no logged in user", async () => {
    const mockUser: IUser = {
      id: "ben",
      passwordHash: "foo",
      permissions: ["admin"],
      email: "email",
    };

    const repo = mock<IRepository<IUser>>({
      get: bunMock(async (id: string) => {
        if (id === "ben") {
          return mockUser;
        }
        return undefined;
      }),
    });

    const handler = new GetCurrentUserCommandHandler(repo);

    const command = mock<ICommandMessage<"GetCurrentUserCommand">>({
      key: "GetCurrentUserCommand",
      id: "foo",
    });

    const eventBus = mock<IEventBus>();

    const session = mock<IStore<ISessionData>>({
      get: bunMock().mockResolvedValue({
        userId: undefined,
        permissions: undefined,
      }),
    });

    const context = { command, eventBus, session };

    await handler.doHandle(context);

    expect(eventBus.emit).toHaveBeenCalledWith("CommandResponse", {
      key: "GetCurrentUserCommand",
      data: undefined,
      id: "foo",
    });
  });

  it("updates session with permissions if they've changed", async () => {
    const mockUser: IUser = {
      id: "ben",
      passwordHash: "foo",
      permissions: ["user"],
      email: "email",
    };

    const repo = mock<IRepository<IUser>>({
      get: bunMock(async (id: string) => {
        if (id === "ben") {
          return mockUser;
        }
        return undefined;
      }),
    });

    const handler = new GetCurrentUserCommandHandler(repo);

    const command = mock<ICommandMessage<"GetCurrentUserCommand">>({
      key: "GetCurrentUserCommand",
      id: "foo",
    });

    const eventBus = mock<IEventBus>();

    const session = mock<IStore<ISessionData>>({
      get: bunMock().mockResolvedValue({
        userId: "ben",
        permissions: ["admin"],
      }),
    });

    const context = { command, eventBus, session };

    await handler.doHandle(context);

    expect(session.set).toHaveBeenCalledWith({
      userId: "ben",
      permissions: ["user"],
    });
  });

  it("throws an error if the logged in user does not exist in the database", async () => {
    const repo = mock<IRepository<IUser>>({
      get: bunMock().mockResolvedValue(undefined),
    });

    const handler = new GetCurrentUserCommandHandler(repo);

    const command = mock<ICommandMessage<"GetCurrentUserCommand">>({
      key: "GetCurrentUserCommand",
      id: "foo",
    });

    const eventBus = mock<IEventBus>();

    const session = mock<IStore<ISessionData>>({
      get: bunMock().mockResolvedValue({
        userId: "ben",
        permissions: ["admin"],
      }),
    });

    const context = { command, eventBus, session };

    await expect(handler.doHandle(context)).rejects.toThrow(AppError);
  });
});
