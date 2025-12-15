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

  it("usinig statement does not if no events have been raised", async () => {
    const today = new Date("2025-11-23T19:14:37.986Z");
    vi.setSystemTime(today);
    const repo = mock<IOauthTokenRepository>();
    const refresher = mock<IOpenBankingTokenRefresher>();
    const tokenFetcher = mock<IOpenBankingTokenFetcher>();

    const manager = new OpenBankingTokenManager(repo, refresher, tokenFetcher, mock());

    const mockToken = mock<OauthToken>();

    when(repo.get).calledWith("foo", "open-banking").thenResolve(mockToken);

    {
      await using token = await manager.getToken("foo");
      void token;
    }
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("saves the returned token in the repo if an event has been raised", async () => {
    const today = new Date("2025-11-23T19:14:37.986Z");
    vi.setSystemTime(today);
    const repo = mock<IOauthTokenRepository>();
    const refresher = mock<IOpenBankingTokenRefresher>();
    const tokenFetcher = mock<IOpenBankingTokenFetcher>();

    const manager = new OpenBankingTokenManager(repo, refresher, tokenFetcher, mock());

    const mockToken = mock<OauthToken>();
    when(mockToken.hasEvents).calledWith().thenReturn(true);

    when(repo.get).calledWith("foo", "open-banking").thenResolve(mockToken);

    {
      await using token = await manager.getToken("foo");
      void token;
    }
    expect(repo.save).toHaveBeenCalledWith(mockToken);
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
});
