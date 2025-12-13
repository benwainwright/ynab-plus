import { mock } from "vitest-mock-extended";
import { http, HttpResponse } from "msw";
import { HttpError } from "@errors";

import type { ILogger } from "@ynab-plus/bootstrap";
import { OauthToken, SyncDetails } from "@ynab-plus/domain";

import {
  MOCK_ACCOUNT_ID,
  MOCK_TOKEN,
  MOCK_TRANSACTIONS,
  server,
  YNAB_API,
} from "@test-helpers";

import { YnabClient } from "./ynab-client.ts";

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  server.resetHandlers();
  vi.useRealTimers();
  vi.setSystemTime(vi.getRealSystemTime());
});

afterAll(() => {
  server.close();
});

describe("the getaccountTransactions method", () => {
  it("throws an http error if there is a bad response", async () => {
    server.use(
      http.get(
        `${YNAB_API}/v1/budgets/:budget/accounts/:account/transactions`,
        () => {
          return HttpResponse.json(
            {
              status: "error",
            },
            { status: 500 },
          );
        },
      ),
    );

    const client = new YnabClient(mock());

    vi.setSystemTime(new Date("2024-11-11T20:39:37.823Z"));

    const token = OauthToken.reconstitute({
      refreshExpiry: undefined,
      provider: "ynab",
      userId: "ben",
      expiry: new Date("2025-11-11T20:39:37.823Z"),
      token: MOCK_TOKEN,
      refreshToken: "bap",
      lastUse: new Date("2025-12-10T20:39:37.823Z"),
      refreshed: new Date("2025-10-10T20:39:37.823Z"),
      created: new Date("2025-11-10T20:39:37.823Z"),
    });

    const syncDetails = SyncDetails.reconstitute({
      id: "foo-bar-2",
      provider: "ynab",
      checkpoint: "blah",
      lastSync: new Date("2025-12-10T20:39:37.823Z"),
    });

    await expect(
      client.getAccountTransactions(token, MOCK_ACCOUNT_ID, syncDetails),
    ).rejects.toThrow(HttpError);
  });
  it("updates syncDetails", async () => {
    const logger = mock<ILogger>();

    const client = new YnabClient(logger);

    const token = OauthToken.reconstitute({
      refreshExpiry: undefined,
      provider: "ynab",
      expiry: new Date(Date.now() + 10_000),
      token: MOCK_TOKEN,
      userId: "ben",
      refreshToken: "bar",
      lastUse: new Date("2025-12-10T20:39:37.823Z"),
      refreshed: new Date("2025-07-10T20:39:37.823Z"),
      created: new Date("2025-05-10T20:39:37.823Z"),
    });

    const syncDetails = SyncDetails.reconstitute({
      id: "foo-bar-2",
      provider: "ynab",
      checkpoint: "blah",
      lastSync: new Date("2025-12-10T20:39:37.823Z"),
    });

    await client.getAccountTransactions(token, MOCK_ACCOUNT_ID, syncDetails);

    expect(syncDetails.checkpoint).toEqual(String(123));
  });
  it("calls the correct endpoint and parses the response data into a transaction", async () => {
    const logger = mock<ILogger>();

    const client = new YnabClient(logger);

    const token = OauthToken.reconstitute({
      refreshExpiry: undefined,
      provider: "ynab",
      expiry: new Date(Date.now() + 10_000),
      token: MOCK_TOKEN,
      userId: "ben",
      refreshToken: "bar",
      lastUse: new Date("2025-12-10T20:39:37.823Z"),
      refreshed: new Date("2025-07-10T20:39:37.823Z"),
      created: new Date("2025-05-10T20:39:37.823Z"),
    });

    const syncDetails = SyncDetails.reconstitute({
      id: "foo-bar-2",
      provider: "ynab",
      checkpoint: "blah",
      lastSync: new Date("2025-12-10T20:39:37.823Z"),
    });

    const result = await client.getAccountTransactions(
      token,
      MOCK_ACCOUNT_ID,
      syncDetails,
    );

    expect(result).toHaveLength(MOCK_TRANSACTIONS.length);
    expect(result[0]?.id).toEqual(MOCK_TRANSACTIONS[0]?.id);
    expect(result[1]?.id).toEqual(MOCK_TRANSACTIONS[2]?.id);
    expect(result[1]?.approved).toEqual(MOCK_TRANSACTIONS[2]?.approved);
  });
});

describe("the getaccounts method", () => {
  it("calls the correct endpoint and parses the response data", async () => {
    const logger = mock<ILogger>();

    const client = new YnabClient(logger);

    vi.setSystemTime(new Date("2024-11-11T20:39:37.823Z"));

    const token = OauthToken.reconstitute({
      refreshExpiry: undefined,
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
    expect(response[0]?.id).toEqual(MOCK_ACCOUNT_ID);
    expect(response[0]?.type).toEqual("checking");
  });
});
