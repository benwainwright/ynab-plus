import { inject, injectable } from "inversify";
import { AccountRepositoryToken, type IAccountRepository } from "@ports";
import { AbstractApplicationService } from "@core";
import { LoggerToken, type ILogger } from "@ynab-plus/bootstrap";
import { type Account, type Permission } from "@ynab-plus/domain";

@injectable()
export class ListAccountsService extends AbstractApplicationService<"ListAccountsCommand"> {
  public override requiredPermissions: Permission[] = ["user", "admin"];

  public constructor(
    @inject(AccountRepositoryToken)
    private accounts: IAccountRepository,

    @inject(LoggerToken)
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "ListAccountsCommand";

  public override async handle(): Promise<Account[]> {
    return await this.accounts.getUserAccounts(this.currentUser.id);
  }
}
