import {
  type IOauthTokenRepository,
  type IBankConnectionRepository,
  type IOpenBankingAccountDetailsFetcher,
} from "@ports";
import { createMockServiceContext } from "@test-helpers";
import { type ILogger } from "@ynab-plus/bootstrap";
import { mock } from "vitest-mock-extended";
import { ListRequisitionAccountsService } from "./list-requisition-accounts-service.ts";
import { when } from "vitest-when";
import { BankConnection, OauthToken } from "@ynab-plus/domain";
import { AppError } from "@errors";

describe("list requisition accounts service", () => {
  it("returns the details from the fetcher if everything is connected", async () => {
    const accountDetailsFetcher = mock<IOpenBankingAccountDetailsFetcher>();
    const bankConnectionRepo = mock<IBankConnectionRepository>();
    const tokenRepo = mock<IOauthTokenRepository>();
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
    const mockToken = mock<OauthToken>();

    when(tokenRepo.get).calledWith("ben", "open-banking").thenResolve(mockToken);

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
      tokenRepo,
      logger,
    );

    const response = await service.doHandle(context);
    expect(response).toEqual(accountDetails);
  });

  it("throws an error if there is no token", async () => {
    const accountDetailsFetcher = mock<IOpenBankingAccountDetailsFetcher>();
    const bankConnectionRepo = mock<IBankConnectionRepository>();
    const tokenRepo = mock<IOauthTokenRepository>();
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

    when(tokenRepo.get).calledWith("ben", "open-banking").thenResolve(undefined);

    const service = new ListRequisitionAccountsService(
      accountDetailsFetcher,
      bankConnectionRepo,
      tokenRepo,
      logger,
    );

    await expect(service.doHandle(context)).rejects.toThrow(AppError);
  });

  it("throws an error if there is no bank connection", async () => {
    const accountDetailsFetcher = mock<IOpenBankingAccountDetailsFetcher>();
    const bankConnectionRepo = mock<IBankConnectionRepository>();
    const tokenRepo = mock<IOauthTokenRepository>();
    const logger = mock<ILogger>();

    const context = createMockServiceContext("ListRequisitionAccountsCommand", undefined, "ben");

    when(bankConnectionRepo.getConnection).calledWith("ben").thenResolve(undefined);

    when(tokenRepo.get).calledWith("ben", "open-banking").thenResolve(mock<OauthToken>());

    const service = new ListRequisitionAccountsService(
      accountDetailsFetcher,
      bankConnectionRepo,
      tokenRepo,
      logger,
    );

    await expect(service.doHandle(context)).rejects.toThrow(AppError);
  });
});
