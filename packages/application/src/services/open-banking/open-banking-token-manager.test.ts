import { mock } from "vitest-mock-extended";
import { OpenBankingTokenManager } from "./open-banking-token-manager.ts";
import {
  type IOauthTokenRepository,
  type IOpenBankingTokenFetcher,
  type IOpenBankingTokenRefresher,
} from "@ports";
import { when } from "vitest-when";
import { OauthToken } from "@ynab-plus/domain";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.setSystemTime(vi.getRealSystemTime());
});

describe("Open banking token manager", () => {
  it("just returns the token from the repo if it is in date", async () => {
    const today = new Date("2025-11-23T19:14:37.986Z");
    vi.setSystemTime(today);
    const repo = mock<IOauthTokenRepository>();
    const refresher = mock<IOpenBankingTokenRefresher>();
    const tokenFetcher = mock<IOpenBankingTokenFetcher>();

    const manager = new OpenBankingTokenManager(repo, refresher, tokenFetcher, mock());

    const mockToken = mock<OauthToken>();

    when(repo.get).calledWith("foo", "open-banking").thenResolve(mockToken);

    const token = await manager.getToken("foo");
    expect(token).toEqual(mockToken);
  });

  it("refreshes the token and saves it in the repo if it is out of date", async () => {
    const today = new Date("2025-11-23T19:14:37.986Z");
    vi.setSystemTime(today);
    const repo = mock<IOauthTokenRepository>();
    const refresher = mock<IOpenBankingTokenRefresher>();
    const tokenFetcher = mock<IOpenBankingTokenFetcher>();

    const manager = new OpenBankingTokenManager(repo, refresher, tokenFetcher, mock());

    const mockToken = mock<OauthToken>({
      refreshToken: "refresh",
    });

    mockToken.refreshExpiry = new Date();

    when(mockToken.isOutOfDate).calledWith().thenReturn(true);
    when(repo.get).calledWith("foo", "open-banking").thenResolve(mockToken);
    when(refresher.refreshToken)
      .calledWith(mockToken)
      .thenResolve({ token: "refreshed-token", tokenExpiresIn: 10 });

    const token = await manager.getToken("foo");
    expect(mockToken.refresh).toHaveBeenCalledWith(
      "refreshed-token",
      "refresh",
      new Date(Date.now() + 10 * 1000),
      new Date(),
    );
    expect(token).toEqual(mockToken);
    expect(repo.save).toHaveBeenCalledWith(mockToken);
  });

  it("fetches a brand new token and saves in the repo if there isn't one", async () => {
    const today = new Date("2025-11-23T19:14:37.986Z");
    vi.setSystemTime(today);
    const repo = mock<IOauthTokenRepository>();
    const refresher = mock<IOpenBankingTokenRefresher>();
    const tokenFetcher = mock<IOpenBankingTokenFetcher>();

    const manager = new OpenBankingTokenManager(repo, refresher, tokenFetcher, mock());

    when(repo.get).calledWith("foo", "open-banking").thenResolve(undefined);

    when(tokenFetcher.getNewToken).calledWith().thenResolve({
      token: "foo",
      refreshToken: "refresh",
      tokenExpiresIn: 10,
      refreshTokenExpiresIn: 10,
    });

    const token = await manager.getToken("foo");

    const expectedToken = OauthToken.reconstitute({
      provider: "open-banking",
      userId: "foo",
      created: new Date(),
      lastUse: undefined,
      refreshed: undefined,
      token: "foo",
      refreshToken: "refresh",
      expiry: new Date(Date.now() + 10 * 1000),
      refreshExpiry: new Date(Date.now() + 10 * 1000),
    });

    expect(repo.save).toHaveBeenCalledWith(expectedToken);
    expect(token).toEqual(expectedToken);
  });
});
