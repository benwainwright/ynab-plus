import type { IOauthNewTokenRequester, IOauthTokenRepository } from "@ports";
import { createMockServiceContext } from "@test-helpers";
import { OauthToken, User } from "@ynab-plus/domain";
import { describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";

import { GenerateNewOauthTokenService } from "./generate-new-oauth-token-service.ts";

describe("generate new oauth token service", () => {
  it("gets a new token from the requester and saves it in the repository", async () => {
    const context = createMockServiceContext(
      "GenerateNewOauthTokenCommand",
      { provider: "foo", code: "1-2-3" },

      new User({
        id: "ben",
        email: "bwainwright28@gmail.com",
        passwordHash: "foo",
        permissions: ["admin"],
      }),
    );

    const save = vi.fn();

    const mockTokenRepo: IOauthTokenRepository = {
      get: vi.fn(),
      save,
    };

    const mockToken = new OauthToken({
      token: "foo",
      userId: "ben",
      refreshToken: "foo-refresh",
      provider: "ynab",
      expiry: new Date("2021-01-01T00:00:00.000Z"),
      created: new Date(),
      refreshed: undefined,
      lastUse: new Date(),
    });

    const requester: IOauthNewTokenRequester = {
      newToken: (userId: string, code: string) => {
        if (code === "1-2-3" && userId === "ben") {
          return Promise.resolve(mockToken);
        }

        throw new Error("Wrong code");
      },
    };

    const factory = vi.fn().mockReturnValue(requester);

    const service = new GenerateNewOauthTokenService(
      mockTokenRepo,
      factory,
      mock(),
    );

    const result = await service.doHandle(context);

    expect(result.status).toEqual("connected");
    expect(save).toHaveBeenCalledWith(mockToken);
  });
});
