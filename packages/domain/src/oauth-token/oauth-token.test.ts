import { OauthToken } from "./oauth-token.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("the oauth token", () => {
  describe("delete", () => {
    it("emits a delete event", () => {
      const newToken = OauthToken.reconstitute({
        refreshExpiry: undefined,
        provider: "ynab",
        token: "token",
        refreshToken: "string",
        expiry: new Date(),
        lastUse: undefined,
        created: new Date(),
        refreshed: undefined,
        userId: "user",
      });

      newToken.delete();

      expect(newToken.pullEvents()).toEqual([
        {
          event: "OauthTokenDeleted",
          data: newToken,
        },
      ]);
    });
  });

  it("emits a domain event on create", () => {
    const today = new Date("2025-11-21T13:18:27.377Z");
    vi.setSystemTime(today);

    const newToken = OauthToken.create({
      provider: "ynab",
      token: "token",
      refreshToken: "string",
      expiry: new Date(),
      refreshExpiry: new Date(),
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
        refreshExpiry: undefined,
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

    describe("freezeDry", () => {
      it("does not return actual token is secure is not true", () => {
        const newToken = OauthToken.reconstitute({
          refreshExpiry: undefined,
          provider: "ynab",
          expiry: new Date(),
          token: "foo-token",
          refreshToken: "foo-refresh",
          lastUse: undefined,
          created: new Date(),
          refreshed: undefined,
          userId: "user",
        });

        const dried = newToken.freezeDry();

        expect(dried).not.toBeInstanceOf(OauthToken);

        expect(dried).toEqual({
          refreshExpiry: undefined,
          provider: "ynab",
          expiry: new Date(),
          token: "",
          refreshToken: "",
          lastUse: undefined,
          created: new Date(),
          refreshed: undefined,
          userId: "user",
        });
      });

      it("returns token if secure is true", () => {
        const newToken = OauthToken.reconstitute({
          refreshExpiry: undefined,
          provider: "ynab",
          expiry: new Date(),
          token: "foo-token",
          refreshToken: "foo-refresh",
          lastUse: undefined,
          created: new Date(),
          refreshed: undefined,
          userId: "user",
        });

        expect(newToken.freezeDry({ secure: true })).toEqual({
          refreshExpiry: undefined,
          provider: "ynab",
          expiry: new Date(),
          token: "foo-token",
          refreshToken: "foo-refresh",
          lastUse: undefined,
          created: new Date(),
          refreshed: undefined,
          userId: "user",
        });
      });
    });

    describe("refreshToken", () => {
      it("sets the token and refresh token, updates the refreshed date and emits an event", () => {
        const today = new Date("2025-11-21T13:18:27.377Z");
        vi.setSystemTime(today);

        const newToken = OauthToken.reconstitute({
          refreshExpiry: undefined,
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
        const refreshExpiry = new Date("2025-12-22T13:18:27.377Z");
        newToken.refresh("foo", "bar", expiry, refreshExpiry);

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
                refreshExpiry: undefined,
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
                refreshExpiry,
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
