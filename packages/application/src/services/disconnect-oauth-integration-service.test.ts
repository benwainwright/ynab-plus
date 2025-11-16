import { mock } from "vitest-mock-extended";
import { User } from "@ynab-plus/domain";
import { DisconnectOauthIntegrationService } from "./disconnect-oauth-integration-service.ts";
import type { IOauthTokenRepository } from "@ports";
import { createMockServiceContext } from "@test-helpers";

describe("disconnect outh integration service", () => {
  it("removes the token in the tokens database", async () => {
    const mockRepo = mock<IOauthTokenRepository>();

    const user = new User({
      id: "ben",
      email: "bwainwright28@gmail.com",
      passwordHash: "foo",
      permissions: ["admin"],
    });

    const service = new DisconnectOauthIntegrationService(mockRepo, mock());

    const context = createMockServiceContext(
      "DisconnectOauthIntegrationCommand",
      { provider: "ynab" },
      user,
    );

    await service.doHandle(context);

    expect(mockRepo.delete).toHaveBeenCalledWith("ben", "ynab");

    const { eventBus } = context;

    expect(eventBus.emit).toHaveBeenCalledWith("OauthIntegrationDisconnected", {
      provider: "ynab",
    });
  });
});
