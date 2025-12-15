import { createMockServiceContext } from "@test-helpers";

import { CheckBankConnectionService } from "./check-bank-connection-service.ts";
import { mock } from "vitest-mock-extended";
import {
  type IBankConnectionRepository,
  type IBankConnectionCreator,
  type IRequesitionAccountFetcher,
} from "@ports";
import { when } from "vitest-when";
import { BankConnection, OauthToken } from "@ynab-plus/domain";
import { OpenBankingTokenManager } from "./open-banking-token-manager.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.setSystemTime(vi.getRealSystemTime());
});

describe("check bank connection service", () => {
  it("returns connection details if correctly connected", async () => {
    const today = new Date("2025-11-23T19:14:37.986Z");
    vi.setSystemTime(today);

    const context = createMockServiceContext("CheckBankConnectionCommand", undefined, "ben");

    const connectionRepo = mock<IBankConnectionRepository>();
    const requestionAccountFetcher = mock<IRequesitionAccountFetcher>();
    const tokenManager = mock<OpenBankingTokenManager>();

    const createdDate = new Date(Date.now());
    const refreshedDate = new Date(Date.now() + 1);
    const expires = new Date(Date.now() + 2);

    const mockToken = mock<
      OauthToken & {
        [Symbol.asyncDispose]: () => Promise<void>;
      }
    >({
      created: createdDate,
      refreshed: refreshedDate,
      expiry: expires,
    });

    when(tokenManager.getToken).calledWith("ben").thenResolve(mockToken);

    const mockConnection = BankConnection.reconstite({
      id: "foo",
      accounts: ["foo"],
      bankName: "monzo",
      requisitionId: "id",
      userId: "ben",
      logo: "foo",
    });

    when(connectionRepo.getConnection).calledWith("ben").thenResolve(mockConnection);

    const service = new CheckBankConnectionService(
      connectionRepo,
      mock(),
      requestionAccountFetcher,
      tokenManager,
      mock(),
    );

    const result = await service.doHandle(context);
    expect(result.status).toEqual("connected");
    if (result.status === "connected") {
      expect(result.bankName).toEqual("monzo");
      expect(result.logo).toEqual("foo");
    }
  });

  it("returns the institution list if no connection is found", async () => {
    const context = createMockServiceContext("CheckBankConnectionCommand", undefined, "ben");

    const connectionRepo = mock<IBankConnectionRepository>();
    const bankConnectionCreator = mock<IBankConnectionCreator>();
    const tokenManager = mock<OpenBankingTokenManager>();

    const mockToken = mock<
      OauthToken & {
        [Symbol.asyncDispose]: () => Promise<void>;
      }
    >();

    when(tokenManager.getToken).calledWith("ben").thenResolve(mockToken);

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
      mock(),
      tokenManager,
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

    const connectionRepo = mock<IBankConnectionRepository>();
    const requestionAccountFetcher = mock<IRequesitionAccountFetcher>();
    const tokenManager = mock<OpenBankingTokenManager>();

    const mockToken = mock<
      OauthToken & {
        [Symbol.asyncDispose]: () => Promise<void>;
      }
    >();

    when(tokenManager.getToken).calledWith("ben").thenResolve(mockToken);

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
      requestionAccountFetcher,
      tokenManager,
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
});
