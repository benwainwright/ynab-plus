import type { IAccountRepository } from "@ports";
import { AbstractApplicationServiceWithUserContext } from "@core";
import type { ILogger } from "@ynab-plus/bootstrap";
import { type Account, type Permission } from "@ynab-plus/domain";

export class ListAccountsService extends AbstractApplicationServiceWithUserContext<"ListAccountsCommand"> {
  public override requiredPermissions: Permission[] = ["user", "admin"];

  public constructor(
    private accounts: IAccountRepository,
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "ListAccountsCommand";

  public override async handle(): Promise<Account[]> {
    return await this.accounts.getUserAccounts(this.currentUser.id);
  }
}
