import { mock } from "vitest-mock-extended";

import type { ILogger } from "@ynab-plus/bootstrap";
import { OauthToken } from "@ynab-plus/domain";

import { MOCK_TOKEN, server } from "@test-helpers";

import { YnabClient } from "./ynab-client.ts";

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe("the getaccounts method", () => {
  it("calls the correct endpoint and parses the response data", async () => {
    const logger = mock<ILogger>();

    const client = new YnabClient(`https://api.ynab.com`, logger);

    const token = new OauthToken({
      provider: "ynab",
      userId: "ben",
      expiry: new Date("2025-11-11T20:39:37.823Z"),
      token: MOCK_TOKEN,
      refreshToken: "bap",
      lastUse: new Date("2025-12-10T20:39:37.823Z"),
      refreshed: new Date("2025-10-10T20:39:37.823Z"),
      created: new Date("2025-11-10T20:39:37.823Z"),
    });

    const response = await client.getAccounts(token);

    expect(response).toHaveLength(1);

    expect(response[0]?.closed).toEqual(true);
    expect(response[0]?.id).toEqual("3fa85f64-5717-4562-b3fc-2c963f66afa6");
    expect(response[0]?.type).toEqual("checking");
  });
});
