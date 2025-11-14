import type { IEventBus } from "@ynab-plus/app";
import { mock } from "vitest-mock-extended";

import { NotAuthorisedError } from "./not-authorised-error.ts";

describe("not authorised error", () => {
  it("stores details about the auth failure", () => {
    const error = new NotAuthorisedError(
      "foo",
      "HelloWorldCommand",
      "user",
      ["admin"],
      ["public"],
    );

    expect(error.message).toEqual("foo");
    expect(error.handler).toEqual("HelloWorldCommand");
    expect(error.userId).toEqual("user");
    expect(error.actualPermissions).toEqual(["admin"]);
    expect(error.requiredPermissions).toEqual(["public"]);
  });

  describe("handle", () => {
    it("stores details about the auth failure", () => {
      const error = new NotAuthorisedError(
        "foo",
        "HelloWorldCommand",
        "user",
        ["admin"],
        ["public"],
      );

      const events = mock<IEventBus>();

      error.handle(events);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(events.emit).toHaveBeenCalledWith("NotAuthorisedError", {
        handler: "HelloWorldCommand",
        userId: "user",
        userPermissions: ["admin"],
        requiredPermissions: ["public"],
      });
    });
  });
});
