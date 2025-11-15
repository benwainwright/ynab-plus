import { AppError } from "@errors";
import { IPasswordHasher, IRepository } from "@ports";
import { createMockServiceContext } from "@test-helpers";
import { User } from "@ynab-plus/domain";
import { mock } from "vitest-mock-extended";
import { when } from "vitest-when";

import { RegisterUserService } from "./register-user-service.ts";

describe("register users service", () => {
  it("should save the passed in user into the repo with a valid hash and log the user in", async () => {
    const context = createMockServiceContext("RegisterCommand", {
      username: "ben",
      password: "foo",
      email: "a@b.c",
    });

    const hasher = mock<IPasswordHasher>();

    when(hasher.hash).calledWith("foo").thenResolve("foo-hash");

    const mockRepo = mock<IRepository<User>>();

    const service = new RegisterUserService(mockRepo, hasher, mock());

    const result = await service.doHandle(context);

    const newUser = new User({
      id: "ben",
      passwordHash: "foo-hash",
      email: "a@b.c",
      permissions: ["user"],
    });

    expect(mockRepo.save).toHaveBeenCalledWith(newUser);

    const { currentUserCache, eventBus } = context;

    expect(result.success).toEqual(true);

    if (result.success) {
      expect(result.id).toEqual("ben");
      expect(currentUserCache.set).toHaveBeenCalledWith(newUser);
      expect(eventBus.emit).toHaveBeenCalledWith("RegisterSuccess", undefined);
    }
  });

  it("rejects the registration if an error is thrown by the repo", async () => {
    const context = createMockServiceContext("RegisterCommand", {
      username: "ben",
      password: "foo",
      email: "a@b.c",
    });

    const hasher = mock<IPasswordHasher>();

    when(hasher.hash).calledWith("foo").thenResolve("foo-hash");

    const mockRepo = mock<IRepository<User>>();

    const service = new RegisterUserService(mockRepo, hasher, mock());

    const error = new AppError(`whoops`);

    when(mockRepo.save)
      .calledWith(
        new User({
          id: "ben",
          passwordHash: "foo-hash",
          email: "a@b.c",
          permissions: ["user"],
        }),
      )
      .thenReject(error);

    const result = await service.doHandle(context);

    const { eventBus, currentUserCache } = context;

    expect(currentUserCache.set).not.toHaveBeenCalled();

    expect(result.success).toEqual(false);
    if (!result.success) {
      expect(eventBus.emit).toHaveBeenCalledWith("RegisterFail", {
        reason: "whoops",
      });
      expect(result.reason).toEqual("whoops");
    }
  });

  it("rethrows unexpected errors", async () => {
    const context = createMockServiceContext("RegisterCommand", {
      username: "ben",
      password: "foo",
      email: "a@b.c",
    });

    const hasher = mock<IPasswordHasher>();

    when(hasher.hash).calledWith("foo").thenResolve("foo-hash");

    const mockRepo = mock<IRepository<User>>();

    const service = new RegisterUserService(mockRepo, hasher, mock());

    when(mockRepo.save)
      .calledWith(
        new User({
          id: "ben",
          passwordHash: "foo-hash",
          email: "a@b.c",
          permissions: ["user"],
        }),
      )
      .thenReject(new Error());

    await expect(service.doHandle(context)).rejects.toThrow();
  });
});
