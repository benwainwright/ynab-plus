import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  setSystemTime,
} from "bun:test";
import getPort from "get-port";
import { YnabOauth2Client } from "./ynab-oauth2-client.ts";
import type { BunRequest, Server } from "bun";
import { waitFor } from "@test-helpers";

let server: Server<undefined> | undefined;
let formData: FormData | undefined;
let port: number | undefined;

const response = {
  access_token: "0cd3d1c4-1107-11e8-b642-0ed5f89f718b",
  token_type: "bearer",
  expires_in: 7200,
  refresh_token: "13ae9632-1107-11e8-b642-0ed5f89f718b",
};

beforeAll(async () => {
  port = await getPort();
  server = Bun.serve({
    port,
    websocket: {
      message: () => {},
    },
    routes: {
      "/oauth/token": async (request: BunRequest) => {
        formData = await request.formData();
        if (request.method === "POST" && (await formData.get("code"))) {
          console.log(`yes`);
          return Response.json(response);
        }
        console.log(`no`);
        return Response.json({ error: "unauthorised" }, { status: 403 });
      },
    },
  });
});

afterAll(() => {
  server?.stop();
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

  it("newCode", async () => {
    const startDate = new Date(1762930654);
    setSystemTime(startDate);
    const clientId = "client-id";
    const clientSecret = "client-secret";
    const redirectUrl = "https://www.google.com";

    const client = new YnabOauth2Client(
      `http://localhost:${port}`,
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

    const newToken = await client.newToken("ben", "1-2-3");

    await waitFor(() => {
      expect(formData).toBeDefined();
    });

    expect(formData?.get("client_id")).toEqual(clientId);
    expect(formData?.get("client_secret")).toEqual(clientSecret);
    expect(formData?.get("redirect_uri")).toEqual(
      "https%3A%2F%2Fwww.google.com",
    );
    expect(formData?.get("grant_type")).toEqual("authorization_code");
    expect(formData?.get("code")).toEqual("1-2-3");

    expect(newToken.expiry.getTime()).toEqual(
      startDate.getTime() + response.expires_in * 1000,
    );
    expect(newToken.provider).toEqual("ynab");
    expect(newToken.token).toEqual(response.access_token);
    expect(newToken.refreshToken).toEqual(response.refresh_token);

    setSystemTime();
  });
});
