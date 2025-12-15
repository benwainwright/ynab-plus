import { type IBankConnectionRepository, type IOpenBankingAccountDetailsFetcher } from "@ports";
import { createMockServiceContext } from "@test-helpers";
import { type ILogger } from "@ynab-plus/bootstrap";
import { mock } from "vitest-mock-extended";
import { ListRequisitionAccountsService } from "./list-requisition-accounts-service.ts";
import { when } from "vitest-when";
import { BankConnection, OauthToken } from "@ynab-plus/domain";
import { AppError } from "@errors";
import type { OpenBankingTokenManager } from "./open-banking-token-manager.ts";

describe("list requisition accounts service", () => {
  it("returns the details from the fetcher if everything is connected", async () => {
    const accountDetailsFetcher = mock<IOpenBankingAccountDetailsFetcher>();
    const bankConnectionRepo = mock<IBankConnectionRepository>();
    const tokenManager = mock<OpenBankingTokenManager>();
    const logger = mock<ILogger>();

    const context = createMockServiceContext("ListRequisitionAccountsCommand", undefined, "ben");

    when(bankConnectionRepo.getConnection)
      .calledWith("ben")
      .thenResolve(
        BankConnection.reconstite({
          id: "foo",
          accounts: ["foo", "bar"],
          bankName: "monzo",
          requisitionId: "id",
          userId: "ben",
          logo: "foo",
        }),
      );
    const mockToken = mock<
      OauthToken & {
        [Symbol.asyncDispose]: () => Promise<void>;
      }
    >();

    when(tokenManager.getToken).calledWith("ben").thenResolve(mockToken);

    const accountDetails = [
      {
        created: new Date(),
        name: "the name",
        id: "foo",
        institutionId: "monzo",
      },
      {
        created: new Date(),
        name: "the name 2",
        id: "bar",
        institutionId: "monzo",
      },
    ];

    when(accountDetailsFetcher.getAccountDetails)
      .calledWith(["foo", "bar"], mockToken)
      .thenResolve(accountDetails);

    const service = new ListRequisitionAccountsService(
      accountDetailsFetcher,
      bankConnectionRepo,
      tokenManager,
      logger,
    );

    const response = await service.doHandle(context);
    expect(response).toEqual(accountDetails);
  });

  it("throws an error if there is no bank connection", async () => {
    const accountDetailsFetcher = mock<IOpenBankingAccountDetailsFetcher>();
    const bankConnectionRepo = mock<IBankConnectionRepository>();
    const tokenManager = mock<OpenBankingTokenManager>();
    const logger = mock<ILogger>();

    const context = createMockServiceContext("ListRequisitionAccountsCommand", undefined, "ben");

    when(bankConnectionRepo.getConnection).calledWith("ben").thenResolve(undefined);

    when(tokenManager.getToken).calledWith("ben").thenResolve(
      mock<
        OauthToken & {
          [Symbol.asyncDispose]: () => Promise<void>;
        }
      >(),
    );

    const service = new ListRequisitionAccountsService(
      accountDetailsFetcher,
      bankConnectionRepo,
      tokenManager,
      logger,
    );

    await expect(service.doHandle(context)).rejects.toThrow(AppError);
  });
});
