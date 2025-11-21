import type { IEventBus } from "@ynab-plus/app";
import { mock } from "vitest-mock-extended";

import { NotAuthorisedError } from "./not-authorised-error.ts";
import { User } from "@ynab-plus/domain";

describe("not authorised error", () => {
  it("stores details about the auth failure", () => {
    const user = User.reconstitute({
      id: "ben",
      email: "a@b.c",
      passwordHash: "foo",
      permissions: ["public"],
    });

    const error = new NotAuthorisedError("foo", "HelloWorldCommand", user, [
      "public",
    ]);

    expect(error.message).toEqual("foo");
    expect(error.handler).toEqual("HelloWorldCommand");
    expect(error.role).toEqual(user);
    expect(error.requiredPermissions).toEqual(["public"]);
  });

  describe("handle", () => {
    it("stores details about the auth failure", () => {
      const user = User.reconstitute({
        id: "ben",
        email: "a@b.c",
        passwordHash: "foo",
        permissions: ["public"],
      });

      const error = new NotAuthorisedError("foo", "HelloWorldCommand", user, [
        "admin",
      ]);

      const events = mock<IEventBus>();

      error.handle(events);

      expect(events.emit).toHaveBeenCalledWith("NotAuthorisedError", {
        handler: "HelloWorldCommand",
        role: user,
        requiredPermissions: ["admin"],
      });
    });
  });
});
