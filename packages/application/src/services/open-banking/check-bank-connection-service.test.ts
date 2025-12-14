import { createMockServiceContext } from "@test-helpers";

import { CheckBankConnectionService } from "./check-bank-connection-service.ts";
import { mock } from "vitest-mock-extended";
import {
  type IBankConnectionRepository,
  type IBankConnectionCreator,
  type IOauthTokenRepository,
  type IOpenBankingTokenFetcher,
  type IRequesitionAccountFetcher,
} from "@ports";
import { when } from "vitest-when";
import { BankConnection, OauthToken } from "@ynab-plus/domain";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.setSystemTime(vi.getRealSystemTime());
});

describe("check bank connection service", () => {
  it("returns the institution list if no connection is found", async () => {
    const context = createMockServiceContext("CheckBankConnectionCommand", undefined, "ben");

    const connectionRepo = mock<IBankConnectionRepository>();
    const bankConnectionCreator = mock<IBankConnectionCreator>();
    const tokenRepo = mock<IOauthTokenRepository>();

    const mockToken = mock<OauthToken>();

    when(tokenRepo.get).calledWith("ben", "open-banking").thenResolve(mockToken);

    when(connectionRepo.getConnection).calledWith("ben").thenResolve(undefined);
    const connections = [
      BankConnection.reconstite({
        id: "foo",
        userId: "ben",
        bankName: "ABN AMRO Bank Commercial",
        logo: "https://storage.googleapis.com/gc-prd-institution_icons-production/UK/PNG/abnamrobank.png",
      }),
      BankConnection.reconstite({
        id: "REVOLUT_REVOGB21",
        userId: "ben",
        bankName: "Revolut",
        logo: "https://storage.googleapis.com/gc-prd-institution_icons-production/UK/PNG/revolut.png",
      }),
    ];

    when(bankConnectionCreator.getConnections)
      .calledWith("ben", mockToken)
      .thenResolve(connections);

    const tokenFetcher = mock<IOpenBankingTokenFetcher>();

    const service = new CheckBankConnectionService(
      connectionRepo,
      bankConnectionCreator,
      tokenFetcher,
      tokenRepo,
      mock(),
      mock(),
    );

    const result = await service.doHandle(context);

    expect(result.status).toEqual("new");
    if (result.status === "new") {
      expect(result.potentialInstitutions).toEqual(connections);
    }
  });

  it("gets the list of accounts if they aren't saved in the connection", async () => {
    const today = new Date("2025-11-23T19:14:37.986Z");
    vi.setSystemTime(today);

    const context = createMockServiceContext("CheckBankConnectionCommand", undefined, "ben");

    const tokenRepo = mock<IOauthTokenRepository>();
    const connectionRepo = mock<IBankConnectionRepository>();
    const requestionAccountFetcher = mock<IRequesitionAccountFetcher>();

    const mockToken = mock<OauthToken>();

    when(tokenRepo.get).calledWith("ben", "open-banking").thenResolve(mockToken);

    const mockConnection = BankConnection.reconstite({
      id: "foo",
      accounts: undefined,
      bankName: "monzo",
      requisitionId: "id",
      userId: "ben",
      logo: "foo",
    });

    when(connectionRepo.getConnection).calledWith("ben").thenResolve(mockConnection);

    when(requestionAccountFetcher.getAccountIds)
      .calledWith(mockConnection, mockToken)
      .thenResolve(["foo", "bar"]);

    const service = new CheckBankConnectionService(
      connectionRepo,
      mock(),
      mock(),
      tokenRepo,
      requestionAccountFetcher,
      mock(),
    );

    await service.doHandle(context);

    expect(connectionRepo.saveConnection).toHaveBeenCalledWith(
      BankConnection.reconstite({
        id: "foo",
        accounts: ["foo", "bar"],
        bankName: "monzo",
        requisitionId: "id",
        userId: "ben",
        logo: "foo",
      }),
    );
  });

  it("gets and saves a new token if no token is found", async () => {
    const today = new Date("2025-11-23T19:14:37.986Z");
    vi.setSystemTime(today);

    const context = createMockServiceContext("CheckBankConnectionCommand", undefined, "ben");

    const connectionRepo = mock<IBankConnectionRepository>();
    const bankConnectionCreator = mock<IBankConnectionCreator>();
    const tokenFetcher = mock<IOpenBankingTokenFetcher>();
    const tokenRepo = mock<IOauthTokenRepository>();

    const mockToken = mock<OauthToken>();

    when(tokenRepo.get).calledWith("ben", "open-banking").thenResolve(undefined);

    when(tokenFetcher.getNewToken).calledWith().thenResolve({
      token: "token",
      refreshToken: "string",
      tokenExpiresIn: 1,
      refreshTokenExpiresIn: 2,
    });

    when(connectionRepo.getConnection).calledWith("ben").thenResolve(undefined);
    const connections = [
      BankConnection.reconstite({
        id: "foo",
        userId: "ben",
        bankName: "ABN AMRO Bank Commercial",
        logo: "https://storage.googleapis.com/gc-prd-institution_icons-production/UK/PNG/abnamrobank.png",
      }),
      BankConnection.reconstite({
        id: "REVOLUT_REVOGB21",
        userId: "ben",
        bankName: "Revolut",
        logo: "https://storage.googleapis.com/gc-prd-institution_icons-production/UK/PNG/revolut.png",
      }),
    ];

    when(bankConnectionCreator.getConnections)
      .calledWith("ben", mockToken)
      .thenResolve(connections);

    const service = new CheckBankConnectionService(
      connectionRepo,
      bankConnectionCreator,
      tokenFetcher,
      tokenRepo,
      mock(),
      mock(),
    );

    await service.doHandle(context);

    expect(tokenRepo.save).toHaveBeenCalledWith(
      OauthToken.reconstitute({
        refreshExpiry: new Date(Date.now() + 2000),
        provider: "open-banking",
        token: "token",
        refreshToken: "string",
        expiry: new Date(Date.now() + 1000),
        lastUse: undefined,
        created: new Date(),
        refreshed: undefined,
        userId: "ben",
      }),
    );
  });
});
