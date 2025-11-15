import { OauthToken } from "@ynab-plus/domain";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { YnabOauth2Client } from "./ynab-oauth2-client.ts";

let formData: FormData | undefined;
let fetchMock: ReturnType<typeof vi.fn>;

const first_token_response = {
  access_token: "0cd3d1c4-1107-11e8-b642-0ed5f89f718b",
  token_type: "bearer",
  expires_in: 7200,
  refresh_token: "13ae9632-1107-11e8-b642-0ed5f89f718b",
};

const refreshedToken = {
  access_token: "new_token",
  token_type: "bearer",
  expires_in: 7200,
  refresh_token: "new_refresh",
};

beforeEach(() => {
  formData = undefined;
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
  formData = undefined;
});

describe("ynab auth client", () => {
  describe("generate redirect url", () => {
    it("generates the correct redirect url for ynab", async () => {
      const clientId = "client-id";
      const clientSecret = "client-secret";
      const redirectUrl = "https://www.google.com";

      const client = new YnabOauth2Client(
        `https://app.ynab.com`,
        {
          value: Promise.resolve(clientId),
        },
        {
          value: Promise.resolve(clientSecret),
        },
        {
          value: Promise.resolve(redirectUrl),
        },
        "ynab",
      );

      const url = await client.generateRedirectUrl();

      expect(url).toEqual(
        `https://app.ynab.com/oauth/authorize?client_id=client-id&redirect_uri=https%3A%2F%2Fwww.google.com&response_type=code`,
      );
    });
  });

  describe("newToken", () => {
    it("requests the code from the ynab API", async () => {
      const startDate = new Date(1762930654);
      vi.useFakeTimers();
      vi.setSystemTime(startDate);
      const clientId = "client-id";
      const clientSecret = "client-secret";
      const redirectUrl = "https://www.google.com";

      const client = new YnabOauth2Client(
        `https://api.ynab.com`,
        {
          value: Promise.resolve(clientId),
        },
        {
          value: Promise.resolve(clientSecret),
        },
        {
          value: Promise.resolve(redirectUrl),
        },
        "ynab",
      );

      fetchMock.mockImplementation((_input, init) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        formData = init?.body as FormData;
        return new Response(JSON.stringify(first_token_response), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });

      const newToken = await client.newToken("ben", "1-2-3");

      expect(formData).toBeDefined();

      expect(formData?.get("client_id")).toEqual(clientId);
      expect(formData?.get("client_secret")).toEqual(clientSecret);
      expect(formData?.get("redirect_uri")).toEqual("https://www.google.com");
      expect(formData?.get("grant_type")).toEqual("authorization_code");
      expect(formData?.get("code")).toEqual("1-2-3");

      expect(newToken.expiry.getTime()).toEqual(
        startDate.getTime() + first_token_response.expires_in * 1000,
      );
      expect(newToken.provider).toEqual("ynab");
      expect(newToken.token).toEqual(first_token_response.access_token);
      expect(newToken.refreshToken).toEqual(first_token_response.refresh_token);
      expect(newToken.created.getTime()).toEqual(startDate.getTime());
      expect(newToken.lastUse).toEqual(undefined);
      expect(newToken.refreshed).toBeUndefined();
      vi.useRealTimers();
    });
  });

  describe("refreshToken", () => {
    it("requests the token via the ynab API", async () => {
      const startDate = new Date(1762930754);
      vi.useFakeTimers();
      vi.setSystemTime(startDate);
      const clientId = "client-id";
      const clientSecret = "client-secret";
      const redirectUrl = "https://www.google.com";

      const client = new YnabOauth2Client(
        `https://api.ynab.com`,
        {
          value: Promise.resolve(clientId),
        },
        {
          value: Promise.resolve(clientSecret),
        },
        {
          value: Promise.resolve(redirectUrl),
        },
        "ynab",
      );

      const now = new Date();

      const token = new OauthToken({
        token: "foo",
        expiry: startDate,
        refreshToken: "foo-refresh",
        userId: "ben",
        provider: "monzo",
        created: now,
        refreshed: undefined,
        lastUse: new Date(),
      });

      fetchMock.mockImplementation((_input, init) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        formData = init?.body as FormData;
        return new Response(JSON.stringify(refreshedToken), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });

      const newToken = await client.refreshToken(token);

      expect(formData).toBeDefined();

      expect(formData?.get("client_id")).toEqual(clientId);
      expect(formData?.get("client_secret")).toEqual(clientSecret);
      expect(formData?.get("grant_type")).toEqual("refresh_token");
      expect(formData?.get("refresh_token")).toEqual("foo-refresh");

      expect(newToken.expiry.getTime()).toEqual(
        startDate.getTime() + refreshedToken.expires_in * 1000,
      );
      expect(newToken.provider).toEqual("ynab");
      expect(newToken.token).toEqual(refreshedToken.access_token);
      expect(newToken.refreshToken).toEqual(refreshedToken.refresh_token);
      expect(newToken.created).toEqual(token.created);
      expect(newToken.lastUse?.getTime()).toEqual(startDate.getTime());
      expect(newToken.refreshed?.getTime()).toEqual(startDate.getTime());
      vi.useRealTimers();
    });
  });
});
