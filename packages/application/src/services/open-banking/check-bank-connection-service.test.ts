import { createMockServiceContext } from "@test-helpers";

import { CheckBankConnectionService } from "./check-bank-connection-service.ts";
import { mock } from "vitest-mock-extended";
import {
  type IOpenBankingTokenFetcher,
  type IBankConnectionRepository,
  type IBankConnectionCreator,
} from "@ports";
import { when } from "vitest-when";
import { BankConnection } from "@ynab-plus/domain";

describe("check bank connection service", () => {
  it("returns the institution list if no connection is found", async () => {
    const context = createMockServiceContext(
      "CheckBankConnectionCommand",
      undefined,
      "ben",
    );

    const connectionRepo = mock<IBankConnectionRepository>();
    const tokenFetcher = mock<IOpenBankingTokenFetcher>();
    const bankConnectionCreator = mock<IBankConnectionCreator>();

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
      .calledWith("ben")
      .thenResolve(connections);

    const service = new CheckBankConnectionService(
      connectionRepo,
      tokenFetcher,
      bankConnectionCreator,
      mock(),
    );

    const result = await service.doHandle(context);

    expect(result.status).toEqual("new");
    if (result.status === "new") {
      expect(result.potentialInstitutions).toEqual(connections);
    }
  });
});
