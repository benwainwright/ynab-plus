import { OauthToken, User } from "@domain";
import { createMockServiceContext } from "@test-helpers";
import { describe, expect, it, mock } from "bun:test";
import { GenerateNewOauthTokenService } from "./generate-new-oauth-token-service.ts";
import type {
  IOauthNewTokenRequester,
  IOauthTokenRepository,
} from "@application/ports";

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

    const save = mock();

    const mockTokenRepo: IOauthTokenRepository = {
      get: mock(),
      save,
    };

    const mockToken = new OauthToken({
      token: "foo",
      userId: "ben",
      refreshToken: "foo-refresh",
      provider: "ynab",
      expiry: new Date("2021-01-01T00:00:00.000Z"),
    });

    const requester: IOauthNewTokenRequester = {
      newToken: (userId: string, code: string) => {
        if (code === "1-2-3" && userId === "ben") {
          return Promise.resolve(mockToken);
        }

        throw new Error("Wrong code");
      },
    };

    const factory = mock().mockReturnValue(requester);

    const service = new GenerateNewOauthTokenService(mockTokenRepo, factory);

    const result = await service.doHandle(context);

    expect(result.status).toEqual("connected");
    expect(save).toHaveBeenCalledWith(mockToken);
  });
});
