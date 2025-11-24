import { server } from "@test-helpers";
import { GocardlessClient } from "./gocardless-client.ts";
import { mockGocardlessData } from "../test-helpers/msw/index.ts";
import { mock } from "vitest-mock-extended";
import { BankConnection } from "@ynab-plus/domain";

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

describe("the gocardless client", () => {
  describe("getLink", () => {
    it("calls the requsitions endpoint with the token and the institution and returns the url and req id", async () => {
      const client = new GocardlessClient(
        `https://bankaccountdata.gocardless.com`,
        { value: Promise.resolve(mockGocardlessData.secretId) },
        { value: Promise.resolve(mockGocardlessData.secretKey) },
        mock(),
      );

      const connection = BankConnection.reconstite({
        bankName: "foo",
        id: mockGocardlessData.mockRequisitionResponse.institution_id,
        userId: "ben",
        logo: "bar",
        requisitionId: "baz",
        token: mockGocardlessData.mockToken,
      });

      const result = await client.getLink(connection);

      expect(result.url).toEqual(
        mockGocardlessData.mockRequisitionResponse.link,
      );
      expect(result.requsitionId).toEqual(
        mockGocardlessData.mockRequisitionResponse.id,
      );
    });
  });

  describe("getconnections", () => {
    it("gets a token, then makes a request to the institutions endpoint and returns a list of bankconnectionsl", async () => {
      const today = new Date("2025-11-23T19:14:37.986Z");
      vi.setSystemTime(today);
      const client = new GocardlessClient(
        `https://bankaccountdata.gocardless.com`,
        { value: Promise.resolve(mockGocardlessData.secretId) },
        { value: Promise.resolve(mockGocardlessData.secretKey) },
        mock(),
      );

      const connections = await client.getConnections("ben");

      expect(connections).toEqual([
        BankConnection.reconstite({
          bankName: mockGocardlessData.mockInstititionsList[0]?.name ?? "",
          id: mockGocardlessData.mockInstititionsList[0]?.id ?? "",
          logo: mockGocardlessData.mockInstititionsList[0]?.logo ?? "",
          userId: "ben",
          token: mockGocardlessData.mockToken,
          refreshToken: mockGocardlessData.mockRefreshToken,
          tokenExpiry: new Date(today.getTime() + 86400 * 1000),
          refreshTokenExpiry: new Date(today.getTime() + 2592000 * 1000),
        }),
        BankConnection.reconstite({
          bankName: mockGocardlessData.mockInstititionsList[1]?.name ?? "",
          id: mockGocardlessData.mockInstititionsList[1]?.id ?? "",
          logo: mockGocardlessData.mockInstititionsList[1]?.logo ?? "",
          userId: "ben",
          token: mockGocardlessData.mockToken,
          refreshToken: mockGocardlessData.mockRefreshToken,
          tokenExpiry: new Date(today.getTime() + 86400 * 1000),
          refreshTokenExpiry: new Date(today.getTime() + 2592000 * 1000),
        }),
      ]);
    });
  });
});
