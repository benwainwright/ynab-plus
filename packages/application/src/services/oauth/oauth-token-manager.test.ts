import { mock } from "vitest-mock-extended";
import { OauthTokenManager } from "./oauth-token-manager.ts";
import { type IOauthCheckerFactory, type IOauthTokenRepository } from "@ports";
import { when } from "vitest-when";
import { OauthToken } from "@ynab-plus/domain";
import { TokenWasNotFoundError } from "./no-token-found-error.ts";

describe("oauth token manager", () => {
  it("allows disposable to be used but doesnt save anything if no events are present", async () => {
    const repo = mock<IOauthTokenRepository>();
    const clientFactory = vi.fn();
    const client = mock<ReturnType<IOauthCheckerFactory>>();
    const manager = new OauthTokenManager(repo, clientFactory, mock());

    when(clientFactory).calledWith("foo").thenResolve(client);

    const token = mock<OauthToken>();

    when(repo.get).calledWith("ben", "foo").thenResolve(token);

    {
      await using result = await manager.getToken("ben", "foo");
      void result;
    }

    expect(repo.save).not.toHaveBeenCalled();
  });

  it("uses disposable to save the token if events are present", async () => {
    const repo = mock<IOauthTokenRepository>();
    const clientFactory = vi.fn();
    const client = mock<ReturnType<IOauthCheckerFactory>>();
    const manager = new OauthTokenManager(repo, clientFactory, mock());

    when(clientFactory).calledWith("foo").thenResolve(client);

    const token = mock<OauthToken>();
    when(token.hasEvents).calledWith().thenReturn(true);

    when(repo.get).calledWith("ben", "foo").thenResolve(token);

    {
      await using result = await manager.getToken("ben", "foo");
      void result;
    }

    expect(repo.save).toHaveBeenCalledWith(token);
  });

  it("returns the token that exists if there is one and its in date", async () => {
    const repo = mock<IOauthTokenRepository>();
    const clientFactory = vi.fn();
    const client = mock<ReturnType<IOauthCheckerFactory>>();
    const manager = new OauthTokenManager(repo, clientFactory, mock());

    when(clientFactory).calledWith("foo").thenResolve(client);

    const token = mock<OauthToken>();

    when(repo.get).calledWith("ben", "foo").thenResolve(token);

    const result = await manager.getToken("ben", "foo");
    expect(result).toEqual(token);
  });

  it("refreshes the token and saves if its out of date", async () => {
    const repo = mock<IOauthTokenRepository>();
    const clientFactory = vi.fn();
    const client = mock<ReturnType<IOauthCheckerFactory>>();
    const manager = new OauthTokenManager(repo, clientFactory, mock());

    const token = mock<OauthToken>();
    const refreshedToken = mock<OauthToken>();

    when(client.refreshToken).calledWith(token).thenResolve(refreshedToken);
    when(clientFactory).calledWith("foo").thenReturn(client);

    when(token.isOutOfDate).calledWith().thenReturn(true);
    when(repo.get).calledWith("ben", "foo").thenResolve(token);

    const result = await manager.getToken("ben", "foo");
    expect(result).toEqual(refreshedToken);
  });

  it("throws an error if there is no token", async () => {
    const repo = mock<IOauthTokenRepository>();

    const clientFactory = vi.fn();
    const client = mock<ReturnType<IOauthCheckerFactory>>();
    const manager = new OauthTokenManager(repo, clientFactory, mock());

    when(clientFactory).calledWith("foo").thenResolve(client);
    when(repo.get).calledWith("ben", "foo").thenResolve(undefined);

    await expect(manager.getToken("ben", "foo")).rejects.toThrow(TokenWasNotFoundError);
  });
});
