import {
  type ICurrentUserSetter,
  type IPasswordVerifier,
  type IRepository,
} from "@ports";
import { createMockServiceContext } from "@test-helpers";
import { User } from "@ynab-plus/domain";
import { mock } from "vitest-mock-extended";
import { when } from "vitest-when";

import { LoginService } from "./login-service.ts";
describe("login service", () => {
  it("gets the user from the repo, verifies the password and stores in the session", async () => {
    const mockUser = User.reconstitute({
      id: "ben",
      passwordHash: "foo-hash",
      permissions: ["admin"],
      email: "email",
    });

    const mockUserSetter = mock<ICurrentUserSetter>();
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

    const service = new LoginService(
      userRepo,
      passwordVerifier,
      mockUserSetter,
      mock(),
    );

    const result = await service.doHandle(context);

    expect(mockUserSetter.set).toHaveBeenCalledWith(mockUser);

    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.id).toEqual("ben");
    }

    expect(eventBus.emit).toHaveBeenCalledWith("LoginSuccess", undefined);
  });

  it("rejects the login if the passwords don't match", async () => {
    const mockUser = User.reconstitute({
      id: "ben",
      passwordHash: "foo-hash",
      permissions: ["admin"],
      email: "email",
    });

    const password = "bar";

    const userRepo = mock<IRepository<User>>();

    when(userRepo.get).calledWith("ben").thenResolve(mockUser);

    const mockUserSetter = mock<ICurrentUserSetter>();
    const passwordVerifier = mock<IPasswordVerifier>();

    when(passwordVerifier.verify)
      .calledWith(password, "foo-hash")
      .thenResolve(false);

    const context = createMockServiceContext("LoginCommand", {
      username: "ben",
      password,
    });

    const { eventBus } = context;

    const service = new LoginService(
      userRepo,
      passwordVerifier,
      mockUserSetter,
      mock(),
    );

    const result = await service.doHandle(context);

    expect(mockUserSetter.set).not.toHaveBeenCalled();

    expect(result.success).toEqual(false);

    expect(eventBus.emit).toHaveBeenCalledWith("LoginFail", undefined);
  });

  it("rejects the login if the user isn't found", async () => {
    const password = "bar";

    const userRepo = mock<IRepository<User>>();

    when(userRepo.get).calledWith("ben").thenResolve(undefined);

    const passwordVerifier = mock<IPasswordVerifier>();

    const mockUserSetter = mock<ICurrentUserSetter>();
    const context = createMockServiceContext("LoginCommand", {
      username: "ben",
      password,
    });

    const { eventBus } = context;

    const service = new LoginService(
      userRepo,
      passwordVerifier,
      mockUserSetter,
      mock(),
    );

    const result = await service.doHandle(context);

    expect(mockUserSetter.set).not.toHaveBeenCalled();

    expect(result.success).toEqual(false);

    expect(eventBus.emit).toHaveBeenCalledWith("LoginFail", undefined);
  });
});
