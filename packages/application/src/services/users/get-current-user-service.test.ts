import { AppError } from "@errors";
import type { ICurrentUserSetter, IRepository } from "@ports";
import { SystemContext, User } from "@ynab-plus/domain";
import { describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";

import { GetCurrentUserService } from "./get-current-user-service.ts";
import { createMockServiceContext } from "@test-helpers";

describe("get user command handler", () => {
  it("throws an error if executed in a system context", async () => {
    const context = createMockServiceContext(
      "GetCurrentUserCommand",
      undefined,
      new SystemContext("test", ["system"]),
    );

    const mockSetter = mock<ICurrentUserSetter>();

    const service = new GetCurrentUserService(mock(), mock(), mockSetter);

    await expect(service.doHandle(context)).rejects.toThrow(AppError);
  });

  it("gets a user from the repository and returns it", async () => {
    const mockUser = User.reconstitute({
      id: "ben",
      passwordHash: "foo",
      permissions: ["admin"],
      email: "email",
    });

    const repo = mock<IRepository<User>>({
      get: vi.fn(async (id: string) => {
        if (id === "ben") {
          return Promise.resolve(mockUser);
        }
        return Promise.resolve(undefined);
      }),
    });

    const context = createMockServiceContext(
      "GetCurrentUserCommand",
      undefined,
      User.reconstitute({
        id: "ben",
        permissions: ["admin"],
        email: "bwainwright28@gmail.com",
        passwordHash: "foo",
      }),
    );

    const mockSetter = mock<ICurrentUserSetter>();
    const handler = new GetCurrentUserService(repo, mock(), mockSetter);

    const response = await handler.doHandle(context);

    expect(response).toEqual(mockUser);
  });

  it("returns undefined if there is no logged in user", async () => {
    const mockUser = User.reconstitute({
      id: "ben",
      passwordHash: "foo",
      permissions: ["admin"],
      email: "email",
    });

    const repo = mock<IRepository<User>>({
      get: vi.fn(async (id: string) => {
        if (id === "ben") {
          return Promise.resolve(mockUser);
        }
        return Promise.resolve(undefined);
      }),
    });

    const context = createMockServiceContext(
      "GetCurrentUserCommand",
      undefined,
      undefined,
    );

    const mockSetter = mock<ICurrentUserSetter>();
    const handler = new GetCurrentUserService(repo, mock(), mockSetter);

    const response = await handler.doHandle(context);

    expect(response).toEqual(undefined);
  });

  it("updates session with permissions if they've changed", async () => {
    const mockUser = User.reconstitute({
      id: "ben",
      passwordHash: "foo",
      permissions: ["user"],
      email: "email",
    });

    const repo = mock<IRepository<User>>({
      get: vi.fn(async (id: string) => {
        if (id === "ben") {
          return Promise.resolve(mockUser);
        }
        return Promise.resolve(undefined);
      }),
    });

    const mockCurrentUserSetter = mock<ICurrentUserSetter>();

    const handler = new GetCurrentUserService(
      repo,
      mock(),
      mockCurrentUserSetter,
    );

    const context = createMockServiceContext(
      "GetCurrentUserCommand",
      undefined,
      User.reconstitute({
        id: "ben",
        permissions: ["admin"],
        email: "bwainwright28@gmail.com",
        passwordHash: "foo",
      }),
    );

    await handler.doHandle(context);

    expect(mockCurrentUserSetter.set.mock.lastCall?.[0]?.permissions).toEqual([
      "user",
    ]);
  });

  it("throws an error if the logged in user does not exist in the database", async () => {
    const repo = mock<IRepository<User>>({
      get: vi.fn().mockResolvedValue(undefined),
    });

    const mockCurrentUserSetter = mock<ICurrentUserSetter>();
    const handler = new GetCurrentUserService(
      repo,
      mock(),
      mockCurrentUserSetter,
    );

    const context = createMockServiceContext(
      "GetCurrentUserCommand",
      undefined,
      User.reconstitute({
        id: "ben",
        permissions: ["admin"],
        email: "bwainwright28@gmail.com",
        passwordHash: "foo",
      }),
    );

    await expect(handler.doHandle(context)).rejects.toThrow(AppError);
  });
});
