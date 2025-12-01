import type { ILogger } from "@ynab-plus/bootstrap";
import {
  type IOauthTokenRepository,
  type IBankConnectionRepository,
  type IInstitutionAuthPageLinkFetcher,
} from "@ports";
import { mock } from "vitest-mock-extended";
import { createMockServiceContext } from "@test-helpers";
import { BankConnection, OauthToken } from "@ynab-plus/domain";
import { GetInstitutionAuthorizationPageLinkService } from "./get-institution-authorization-page-link-service.ts";
import { when } from "vitest-when";

describe("get institution link service", () => {
  it("throw an error if there is no token", async () => {
    const mockLogger = mock<ILogger>();
    const mockFetcher = mock<IInstitutionAuthPageLinkFetcher>();
    const mockBankConnectionRepo = mock<IBankConnectionRepository>();

    const tokenRepo = mock<IOauthTokenRepository>();
    const mockBankConnection = mock<BankConnection>();

    const service = new GetInstitutionAuthorizationPageLinkService(
      mockFetcher,
      mockBankConnectionRepo,
      tokenRepo,
      mockLogger,
    );
    when(tokenRepo.get)
      .calledWith("ben", "open-banking")
      .thenResolve(undefined);

    const context = createMockServiceContext(
      "GetInstitutionAuthorizationPageLinkCommand",
      mockBankConnection,
      "ben",
    );

    await expect(service.doHandle(context)).rejects.toThrow();
  });
  it("passes the bank connection to the fetcher and returns the link", async () => {
    const mockLogger = mock<ILogger>();
    const mockFetcher = mock<IInstitutionAuthPageLinkFetcher>();
    const mockBankConnectionRepo = mock<IBankConnectionRepository>();

    const tokenRepo = mock<IOauthTokenRepository>();
    const mockBankConnection = mock<BankConnection>();

    const service = new GetInstitutionAuthorizationPageLinkService(
      mockFetcher,
      mockBankConnectionRepo,
      tokenRepo,
      mockLogger,
    );
    const newToken = OauthToken.reconstitute({
      refreshExpiry: undefined,
      provider: "ynab",
      token: "token",
      refreshToken: "string",
      expiry: new Date(),
      lastUse: undefined,
      created: new Date(),
      refreshed: undefined,
      userId: "user",
    });

    when(tokenRepo.get).calledWith("ben", "open-banking").thenResolve(newToken);

    const context = createMockServiceContext(
      "GetInstitutionAuthorizationPageLinkCommand",
      mockBankConnection,
      "ben",
    );

    const link = "https://www.google.com";

    when(mockFetcher.getLink)
      .calledWith(mockBankConnection, newToken)
      .thenResolve({ url: link, requsitionId: "foo" });

    const result = await service.doHandle(context);

    expect(mockBankConnection.saveRequisitionId).toHaveBeenLastCalledWith(
      "foo",
    );

    expect(mockBankConnectionRepo.saveConnection).toHaveBeenCalledWith(
      mockBankConnection,
    );

    expect(result).toEqual({ url: link });
  });
});
