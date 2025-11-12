import { describe, expect, it, mock, setSystemTime } from "bun:test";
import { CheckOauthIntegrationStatusService } from "./check-oauth-integration-status-service.ts";
import type {
  IOAuthTokenRefresher,
  IOauthTokenRepository,
  IOauthRedirectUrlGenerator,
} from "@ports";
import { createMockServiceContext } from "@ynab-plus/test-helpers";
import { OauthToken, User } from "@ynab-plus/domain";

describe("check oauth-integration-status-service", () => {
  it("responds with a redirect url if there is no token", async () => {
    const mockTokenRepo: IOauthTokenRepository = {
      get: mock().mockResolvedValue(undefined),
      save: mock(),
    };

    const redirectUrl = "foo";

    const mockOauthClient: IOauthRedirectUrlGenerator & IOAuthTokenRefresher = {
      generateRedirectUrl: mock().mockReturnValue(redirectUrl),
      refreshToken: mock(),
    };

    const oauthClientFactory = mock().mockReturnValue(mockOauthClient);

    const service = new CheckOauthIntegrationStatusService(
      mockTokenRepo,
      oauthClientFactory,
    );

    const context = createMockServiceContext(
      "CheckOauthIntegrationStatusCommand",
      { provider: "foo" },

      new User({
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
    setSystemTime(new Date("2020-01-01T00:00:00.000Z"));

    const mockToken = new OauthToken({
      token: "foo",
      userId: "ben",
      refreshToken: "foo-refresh",
      provider: "ynab",
      expiry: new Date("2021-01-01T00:00:00.000Z"),
    });

    const save = mock();

    const mockTokenRepo: IOauthTokenRepository = {
      get: mock((userId: string, provider: string) => {
        if (userId === "ben" && provider === "ynab") {
          return Promise.resolve(mockToken);
        }
        return Promise.resolve(undefined);
      }),
      save,
    };

    const redirectUrl = "foo";

    const mockOauthClient: IOauthRedirectUrlGenerator & IOAuthTokenRefresher = {
      generateRedirectUrl: mock().mockReturnValue(redirectUrl),
      refreshToken: mock(),
    };

    const oauthClientFactory = mock().mockReturnValue(mockOauthClient);

    const service = new CheckOauthIntegrationStatusService(
      mockTokenRepo,
      oauthClientFactory,
    );

    const context = createMockServiceContext(
      "CheckOauthIntegrationStatusCommand",
      { provider: "ynab" },

      new User({
        id: "ben",
        email: "bwainwright28@gmail.com",
        passwordHash: "foo",
        permissions: ["admin"],
      }),
    );

    const response = await service.doHandle(context);

    expect(response.status).toEqual("connected");
    expect(save).not.toHaveBeenCalled();
    setSystemTime();
  });

  it("refreshes and stores token if the token if it is out of date", async () => {
    setSystemTime(new Date("2020-01-01T00:00:00.000Z"));

    const mockFirstToken = new OauthToken({
      token: "foo",
      refreshToken: "foo-refresh",
      provider: "ynab",
      userId: "ben",
      expiry: new Date("2019-01-01T00:00:00.000Z"),
    });

    const mockSecondToken = new OauthToken({
      token: "bar",
      refreshToken: "foo-refresh-2",
      userId: "ben",
      provider: "ynab",
      expiry: new Date("2021-01-01T00:00:00.000Z"),
    });

    const save = mock();

    const mockTokenRepo: IOauthTokenRepository = {
      get: mock((userId: string, provider: string) => {
        if (userId === "ben" && provider === "ynab") {
          return Promise.resolve(mockFirstToken);
        }
        return Promise.resolve(undefined);
      }),
      save,
    };

    const redirectUrl = "foo";

    const refresh = mock((token: OauthToken) => {
      if (token === mockFirstToken) {
        return Promise.resolve(mockSecondToken);
      }
      throw new Error("Wrong token");
    });

    const mockOauthClient: IOauthRedirectUrlGenerator & IOAuthTokenRefresher = {
      generateRedirectUrl: mock().mockReturnValue(redirectUrl),
      refreshToken: refresh,
    };

    const oauthClientFactory = mock().mockReturnValue(mockOauthClient);

    const service = new CheckOauthIntegrationStatusService(
      mockTokenRepo,
      oauthClientFactory,
    );

    const context = createMockServiceContext(
      "CheckOauthIntegrationStatusCommand",
      { provider: "ynab" },

      new User({
        id: "ben",
        email: "bwainwright28@gmail.com",
        passwordHash: "foo",
        permissions: ["admin"],
      }),
    );

    const response = await service.doHandle(context);
    expect(save).toHaveBeenCalledWith(mockSecondToken);

    expect(response.status).toEqual("connected");
    setSystemTime();
  });
});
