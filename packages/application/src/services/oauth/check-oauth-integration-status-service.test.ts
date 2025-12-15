import type { IOauthRedirectUrlGenerator, IOAuthTokenRefresher } from "@ports";
import { createMockServiceContext } from "@test-helpers";
import { OauthToken, User } from "@ynab-plus/domain";
import { describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";

import { CheckOauthIntegrationStatusService } from "./check-oauth-integration-status-service.ts";
import { OauthTokenManager } from "./oauth-token-manager.ts";
import { when } from "vitest-when";
import { TokenWasNotFoundError } from "./no-token-found-error.ts";

describe("check oauth-integration-status-service", () => {
  it("responds with a redirect url if there is no token", async () => {
    const mockTokenManager = mock<OauthTokenManager>();

    mockTokenManager.getToken.mockRejectedValue(new TokenWasNotFoundError(`No token found!`));

    const redirectUrl = "foo";

    const mockOauthClient: IOauthRedirectUrlGenerator & IOAuthTokenRefresher = {
      generateRedirectUrl: vi.fn().mockReturnValue(redirectUrl),
      refreshToken: vi.fn(),
    };

    const oauthClientFactory = vi.fn().mockReturnValue(mockOauthClient);

    const service = new CheckOauthIntegrationStatusService(
      mockTokenManager,
      oauthClientFactory,
      mock(),
    );

    const context = createMockServiceContext(
      "CheckOauthIntegrationStatusCommand",
      { provider: "foo" },

      User.reconstitute({
        id: "ben",
        email: "bwainwright28@gmail.com",
        passwordHash: "foo",
        permissions: ["admin"],
      }),
    );

    const response = await service.doHandle(context);

    expect(response.status).toEqual("not_connected");
    if (response.status === "not_connected") {
      expect(response.redirectUrl).toEqual(redirectUrl);
    }
  });

  it("returns success if there is a token that is in date", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00.000Z"));

    try {
      const save = vi.fn();

      const mockToken = mock<
        OauthToken & {
          [Symbol.asyncDispose]: () => Promise<void>;
        }
      >();

      const mockTokenManager = mock<OauthTokenManager>();

      when(mockTokenManager.getToken).calledWith("ben", "ynab").thenResolve(mockToken);

      const redirectUrl = "foo";

      const mockOauthClient: IOauthRedirectUrlGenerator & IOAuthTokenRefresher = {
        generateRedirectUrl: vi.fn().mockReturnValue(redirectUrl),
        refreshToken: vi.fn(),
      };

      const oauthClientFactory = vi.fn().mockReturnValue(mockOauthClient);

      const service = new CheckOauthIntegrationStatusService(
        mockTokenManager,
        oauthClientFactory,
        mock(),
      );

      const context = createMockServiceContext(
        "CheckOauthIntegrationStatusCommand",
        { provider: "ynab" },

        User.reconstitute({
          id: "ben",
          email: "bwainwright28@gmail.com",
          passwordHash: "foo",
          permissions: ["admin"],
        }),
      );

      const response = await service.doHandle(context);

      expect(response.status).toEqual("connected");
      if (response.status === "connected") {
        expect(response.created).toEqual(mockToken.created);
        expect(response.refreshed).toEqual(mockToken.refreshed);
        expect(response.expiry).toEqual(mockToken.expiry);
      }
      expect(save).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
