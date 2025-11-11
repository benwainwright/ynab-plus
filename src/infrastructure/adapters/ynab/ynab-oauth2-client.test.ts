import { describe, expect, it } from "bun:test";
import { YnabOauth2Client } from "./ynab-oauth2-client.ts";

describe("ynab auth client", () => {
  it("generates the correct redirect url for ynab", async () => {
    const clientId = "client-id";
    const redirectUrl = "https://www.google.com";

    const client = new YnabOauth2Client(
      {
        value: Promise.resolve(clientId),
      },
      {
        value: Promise.resolve(redirectUrl),
      },
    );

    const url = await client.getRedirectUrl();

    expect(url).toEqual(
      `https://app.ynab.com/oauth/authorize?client_id=client-id&redirect_uri=https%3A%2F%2Fwww.google.com&response_type=code`,
    );
  });
});
