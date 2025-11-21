import { OauthToken } from "./oauth-token.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("the oauth token", () => {
  it("emits a domain event on create", () => {
    const today = new Date("2025-11-21T13:18:27.377Z");
    vi.setSystemTime(today);

    const newToken = OauthToken.create({
      provider: "ynab",
      token: "token",
      refreshToken: "string",
      expiry: new Date(),
      userId: "user",
    });

    expect(newToken.pullEvents()).toEqual([
      {
        event: "OauthTokenCreated",
        data: newToken,
      },
    ]);

    expect(newToken.refreshed).toEqual(undefined);
    expect(newToken.created).toEqual(today);
    expect(newToken.lastUse).toEqual(undefined);
  });

  describe("useToken", () => {
    it("returns the token value, sets the lastUse date and emits an event", () => {
      const today = new Date("2025-11-21T13:18:27.377Z");
      vi.setSystemTime(today);

      const newToken = OauthToken.reconstitute({
        provider: "ynab",
        token: "token",
        refreshToken: "string",
        expiry: new Date(),
        lastUse: undefined,
        created: new Date(),
        refreshed: undefined,
        userId: "user",
      });

      const token = newToken.use();
      expect(token).toEqual("token");
      expect(newToken.lastUse).toEqual(today);

      expect(newToken.pullEvents()).toEqual([
        {
          event: "OauthTokenUsed",
          data: newToken,
        },
      ]);
    });

    describe("refreshToken", () => {
      it("sets the token and refresh token, updates the refreshed date and emits an event", () => {
        const today = new Date("2025-11-21T13:18:27.377Z");
        vi.setSystemTime(today);

        const newToken = OauthToken.reconstitute({
          provider: "ynab",
          token: "token",
          refreshToken: "string",
          expiry: new Date(),
          lastUse: undefined,
          created: new Date(),
          refreshed: undefined,
          userId: "user",
        });

        const expiry = new Date("2025-11-22T13:18:27.377Z");
        newToken.refresh("foo", "bar", expiry);

        expect(newToken.token).toEqual("foo");
        expect(newToken.refreshToken).toEqual("bar");
        expect(newToken.refreshed).toEqual(today);
        expect(newToken.expiry).toEqual(expiry);

        expect(newToken.pullEvents()).toEqual([
          {
            event: "OauthTokenRefreshed",
            data: {
              old: OauthToken.reconstitute({
                provider: "ynab",
                token: "token",
                refreshToken: "string",
                expiry: new Date(),
                lastUse: undefined,
                created: new Date(),
                refreshed: undefined,
                userId: "user",
              }),
              new: OauthToken.reconstitute({
                provider: "ynab",
                token: "foo",
                refreshToken: "bar",
                expiry,
                lastUse: undefined,
                created: new Date(),
                refreshed: new Date(),
                userId: "user",
              }),
            },
          },
        ]);
      });
    });
  });
});
