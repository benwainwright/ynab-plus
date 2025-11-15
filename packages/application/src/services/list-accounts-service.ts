import type { IAccountRepository, IHandleContext } from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { Account } from "@ynab-plus/domain";

import { AbstractApplicationService } from "./abstract-application-service.ts";

export class ListAccountsService extends AbstractApplicationService<"ListAccountsCommand"> {
  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "user",
    "admin",
  ];

  public constructor(
    private accounts: IAccountRepository,
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "ListAccountsCommand";

  public override async handle({
    currentUserCache,
  }: IHandleContext<"ListAccountsCommand">): Promise<Account[]> {
    const user = await currentUserCache.require();

    const accounts = await this.accounts.getUserAccounts(user.id);
    console.log(accounts);
    return accounts;
  }
}
