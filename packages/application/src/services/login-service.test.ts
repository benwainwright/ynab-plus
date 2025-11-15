import { type IPasswordVerifier, type IRepository } from "@ports";
import { createMockServiceContext } from "@test-helpers";
import { User } from "@ynab-plus/domain";
import { mock } from "vitest-mock-extended";
import { when } from "vitest-when";

import { LoginService } from "./login-service.ts";
describe("login service", () => {
  it("gets the user from the repo, verifies the password and stores in the session", async () => {
    const mockUser = new User({
      id: "ben",
      passwordHash: "foo-hash",
      permissions: ["admin"],
      email: "email",
    });

    const password = "foo";

    const userRepo = mock<IRepository<User>>();

    when(userRepo.get).calledWith("ben").thenResolve(mockUser);

    const passwordVerifier = mock<IPasswordVerifier>();

    when(passwordVerifier.verify)
      .calledWith(password, "foo-hash")
      .thenResolve(true);

    const context = createMockServiceContext("LoginCommand", {
      username: "ben",
      password,
    });

    const { eventBus } = context;

    const service = new LoginService(userRepo, passwordVerifier, mock());

    const result = await service.doHandle(context);

    expect(context.currentUserCache.set).toHaveBeenCalledWith(mockUser);

    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.id).toEqual("ben");
    }

    expect(eventBus.emit).toHaveBeenCalledWith("LoginSuccess", undefined);
  });

  it("rejects the login if the passwords don't match", async () => {
    const mockUser = new User({
      id: "ben",
      passwordHash: "foo-hash",
      permissions: ["admin"],
      email: "email",
    });

    const password = "bar";

    const userRepo = mock<IRepository<User>>();

    when(userRepo.get).calledWith("ben").thenResolve(mockUser);

    const passwordVerifier = mock<IPasswordVerifier>();

    when(passwordVerifier.verify)
      .calledWith(password, "foo-hash")
      .thenResolve(false);

    const context = createMockServiceContext("LoginCommand", {
      username: "ben",
      password,
    });

    const { eventBus } = context;

    const service = new LoginService(userRepo, passwordVerifier, mock());

    const result = await service.doHandle(context);

    expect(context.currentUserCache.set).not.toHaveBeenCalled();

    expect(result.success).toEqual(false);

    expect(eventBus.emit).toHaveBeenCalledWith("LoginFail", undefined);
  });

  it("rejects the login if the user isn't found", async () => {
    const password = "bar";

    const userRepo = mock<IRepository<User>>();

    when(userRepo.get).calledWith("ben").thenResolve(undefined);

    const passwordVerifier = mock<IPasswordVerifier>();

    const context = createMockServiceContext("LoginCommand", {
      username: "ben",
      password,
    });

    const { eventBus } = context;

    const service = new LoginService(userRepo, passwordVerifier, mock());

    const result = await service.doHandle(context);

    expect(context.currentUserCache.set).not.toHaveBeenCalled();

    expect(result.success).toEqual(false);

    expect(eventBus.emit).toHaveBeenCalledWith("LoginFail", undefined);
  });
});
