import type { ILogger } from "@ynab-plus/bootstrap";
import type { IInstitutionAuthPageLinkFetcher } from "@ports";
import { mock } from "vitest-mock-extended";
import { createMockServiceContext } from "@test-helpers";
import { BankConnection } from "@ynab-plus/domain";
import { GetInstitutionAuthorizationPageLinkService } from "./get-institution-authorization-page-link-service.ts";
import { when } from "vitest-when";

describe("get institution link service", () => {
  it("passes the bank connection to the fetcher and returns the link", async () => {
    const mockLogger = mock<ILogger>();
    const mockFetcher = mock<IInstitutionAuthPageLinkFetcher>();

    const mockBankConnection = mock<BankConnection>();

    const service = new GetInstitutionAuthorizationPageLinkService(
      mockFetcher,
      mockLogger,
    );

    const context = createMockServiceContext(
      "GetInstitutionAuthorizationPageLinkCommand",
      mockBankConnection,
      "ben",
    );

    const link = "https://www.google.com";

    when(mockFetcher.getLink).calledWith(mockBankConnection).thenResolve(link);

    const result = await service.doHandle(context);

    expect(result).toEqual({ url: link });
  });
});
