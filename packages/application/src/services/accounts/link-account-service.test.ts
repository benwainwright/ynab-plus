import { type IAccountRepository } from "@ports";
import { LinkAccountService } from "./link-account-service.ts";
import { mock } from "vitest-mock-extended";
import { createMockServiceContext } from "@test-helpers";
import { when } from "vitest-when";
import type { Account } from "@ynab-plus/domain";

describe("link account service", () => {
  it("calls link on the account and then saves it back in the repo", async () => {
    const accountRepo = mock<IAccountRepository>();

    const service = new LinkAccountService(accountRepo, mock());

    const context = createMockServiceContext(
      "LinkAccountCommand",
      {
        obAccount: "ob-account",
        ynabAccount: "ynab-account"
      },
      "ben"
    );

    const mockAccount = mock<Account>();

    when(accountRepo.getAccount).calledWith("ynab-account").thenResolve(mockAccount);

    await service.doHandle(context);

    expect(mockAccount.linkAccount).toHaveBeenCalledWith("ob-account");
    expect(accountRepo.saveAccount).toHaveBeenCalledWith(mockAccount);
  });
});
