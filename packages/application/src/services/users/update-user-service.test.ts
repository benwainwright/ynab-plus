import { AppError } from "@errors";
import type { IMultipleRepository, IPasswordHasher, IRepository } from "@ports";
import { createMockServiceContext } from "@test-helpers";
import { User } from "@ynab-plus/domain";
import { mock } from "vitest-mock-extended";
import { when } from "vitest-when";

import { UpdateUserService } from "./update-user-service.ts";
describe("update users service", () => {
  it("leaves the password alone if password is an empty string", async () => {
    const loggedInUser = User.reconstitute({
      id: "admin",
      passwordHash: "otherHash",
      email: "other@email.com",
      permissions: ["admin"],
    });

    const context = createMockServiceContext(
      "UpdateUserCommand",
      {
        username: "ben",
        password: "",
        email: "a@b.c",
        permissions: ["admin"],
      },
      loggedInUser,
    );

    const hasher = mock<IPasswordHasher>();

    const mockRepo = mock<IRepository<User> & IMultipleRepository<User>>();

    const existingUser = User.reconstitute({
      id: "ben",
      passwordHash: "otherHash",
      email: "other@email.com",
      permissions: ["user"],
    });

    when(mockRepo.get).calledWith("ben").thenResolve(existingUser);

    const service = new UpdateUserService(mockRepo, hasher, mock());

    await service.doHandle(context);

    expect(hasher.hash).not.toBeCalled();
  });
  it("should update the existing user", async () => {
    const loggedInUser = User.reconstitute({
      id: "admin",
      passwordHash: "otherHash",
      email: "other@email.com",
      permissions: ["admin"],
    });

    const context = createMockServiceContext(
      "UpdateUserCommand",
      {
        username: "ben",
        password: "foo",
        email: "a@b.c",
        permissions: ["admin"],
      },
      loggedInUser,
    );

    const hasher = mock<IPasswordHasher>();

    when(hasher.hash).calledWith("foo").thenResolve("foo-hash");

    const mockRepo = mock<IRepository<User> & IMultipleRepository<User>>();

    const existingUser = User.reconstitute({
      id: "ben",
      passwordHash: "otherHash",
      email: "other@email.com",
      permissions: ["user"],
    });

    when(mockRepo.get).calledWith("ben").thenResolve(existingUser);

    const service = new UpdateUserService(mockRepo, hasher, mock());

    const result = await service.doHandle(context);

    expect(mockRepo.save.mock.lastCall?.[0].permissions).toEqual(["admin"]);
    expect(mockRepo.save.mock.lastCall?.[0].email).toEqual("a@b.c");

    expect(result.success).toEqual(true);
  });

  it("rejects the update if an error is thrown by the repo", async () => {
    const loggedInUser = User.reconstitute({
      id: "admin",
      passwordHash: "otherHash",
      email: "other@email.com",
      permissions: ["admin"],
    });

    const context = createMockServiceContext(
      "UpdateUserCommand",
      {
        username: "ben",
        password: "foo",
        email: "a@b.c",
        permissions: ["admin"],
      },
      loggedInUser,
    );

    const hasher = mock<IPasswordHasher>();

    when(hasher.hash).calledWith("foo").thenResolve("foo-hash");

    const mockRepo = mock<IRepository<User> & IMultipleRepository<User>>();

    const existingUser = mock<User>({
      id: "ben",
      passwordHash: "other-hash",
      email: "a@b.d",
      permissions: ["admin"],
    });

    when(mockRepo.get).calledWith("ben").thenResolve(existingUser);

    const error = new AppError(`whoops`);

    mockRepo.save.mockRejectedValue(error);

    const service = new UpdateUserService(mockRepo, hasher, mock());

    const result = await service.doHandle(context);

    const { eventBus } = context;

    expect(result.success).toEqual(false);
    if (!result.success) {
      expect(eventBus.emit).toHaveBeenCalledWith("UserUpdateFail", {
        reason: "whoops",
      });
      expect(result.reason).toEqual("whoops");
    }
  });

  it("rejects update if there is no existing user", async () => {
    const loggedInUser = User.reconstitute({
      id: "admin",
      passwordHash: "otherHash",
      email: "other@email.com",
      permissions: ["admin"],
    });

    const context = createMockServiceContext(
      "UpdateUserCommand",
      {
        username: "ben",
        password: "foo",
        email: "a@b.c",
        permissions: ["admin"],
      },
      loggedInUser,
    );

    const hasher = mock<IPasswordHasher>();

    when(hasher.hash).calledWith("foo").thenResolve("foo-hash");

    const mockRepo = mock<IRepository<User> & IMultipleRepository<User>>();

    when(mockRepo.get).calledWith("ben").thenResolve(undefined);

    const service = new UpdateUserService(mockRepo, hasher, mock());

    const result = await service.doHandle(context);

    const { eventBus } = context;

    expect(result.success).toEqual(false);
    if (!result.success) {
      expect(eventBus.emit).toHaveBeenCalledWith("UserUpdateFail", {
        reason: `User ben does not exist`,
      });
      expect(result.reason).toEqual("User ben does not exist");
    }
  });

  it("rethrows unexpected errors", async () => {
    const loggedInUser = User.reconstitute({
      id: "admin",
      passwordHash: "otherHash",
      email: "other@email.com",
      permissions: ["admin"],
    });
    const context = createMockServiceContext(
      "UpdateUserCommand",
      {
        username: "ben",
        password: "foo",
        email: "a@b.c",
        permissions: ["admin"],
      },
      loggedInUser,
    );

    const hasher = mock<IPasswordHasher>();

    when(hasher.hash).calledWith("foo").thenResolve("foo-hash");

    const mockRepo = mock<IRepository<User> & IMultipleRepository<User>>();

    const existingUser = User.reconstitute({
      id: "ben",
      passwordHash: "other-hash",
      email: "a@b.d",
      permissions: ["admin"],
    });

    when(mockRepo.get).calledWith("ben").thenResolve(existingUser);

    mockRepo.save.mockRejectedValue(new Error());

    const service = new UpdateUserService(mockRepo, hasher, mock());

    await expect(service.doHandle(context)).rejects.toThrow();
  });
});
