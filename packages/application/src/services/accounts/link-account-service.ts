import { AbstractApplicationService, inject } from "@core";
import { AppError } from "@errors";
import type { IAccountRepository, IHandleContext } from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { IRole, Permission, User } from "@ynab-plus/domain";

export class LinkAccountService extends AbstractApplicationService<"LinkAccountCommand"> {
  public override readonly commandName = "LinkAccountCommand";

  public override requiredPermissions: Permission[] = ["user", "admin"];

  public constructor(
    @inject("AccountRepository")
    private readonly accountRepo: IAccountRepository,

    @inject("Logger")
    logger: ILogger
  ) {
    super(logger);
  }

  protected override async handle<TRole extends IRole = User>({
    command: {
      data: { obAccount, ynabAccount }
    }
  }: IHandleContext<"LinkAccountCommand", TRole>): Promise<undefined> {
    const account = await this.accountRepo.getAccount(ynabAccount);
    if (!account) {
      throw new AppError(`Account was not found`);
    }
    account.linkAccount(obAccount);
    await this.accountRepo.saveAccount(account);
  }
}
