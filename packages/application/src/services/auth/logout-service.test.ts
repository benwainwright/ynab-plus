import { createMockServiceContext } from "@test-helpers";
import { User } from "@ynab-plus/domain";
import { mock } from "vitest-mock-extended";

import { LogoutService } from "./logout-service.ts";
import type { ICurrentUserSetter } from "@ports";

describe("logout service", () => {
  it("deletes the current user from the session cache", async () => {
    const mockUser = User.reconstitute({
      id: "ben",
      passwordHash: "foo",
      permissions: ["admin"],
      email: "email"
    });
    const mockUserSetter = mock<ICurrentUserSetter>();

    const context = createMockServiceContext("LogoutCommand", undefined, mockUser);

    const service = new LogoutService(mockUserSetter, mock());

    await service.doHandle(context);

    expect(mockUserSetter.set).toHaveBeenCalledWith(undefined);
  });
});
