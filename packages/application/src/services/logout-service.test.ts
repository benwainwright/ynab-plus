import { createMockServiceContext } from "@test-helpers";
import type { User } from "@ynab-plus/domain";
import { mock } from "vitest-mock-extended";

import { LogoutService } from "./logout-service.ts";

describe("logout service", () => {
  it("deletes the current user from the session cache", async () => {
    const mockUser = mock<User>({
      id: "ben",
      passwordHash: "foo",
      permissions: ["admin"],
      email: "email",
    });

    const context = createMockServiceContext(
      "LogoutCommand",
      undefined,
      mockUser,
    );

    const service = new LogoutService(mock());

    await service.doHandle(context);

    expect(context.currentUserCache.set).toHaveBeenCalledWith(undefined);
  });
});
