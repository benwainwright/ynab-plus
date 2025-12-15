import { AbstractApplicationService, inject } from "@core";
import { AppError } from "@errors";
import type {
  IAccountRepository,
  IBankConnectionRepository,
  IHandleContext,
  IOpenBankingAccountBalanceFetcher,
} from "@ports";
import type { OpenBankingTokenManager } from "@services/open-banking";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { IRole, Permission, User } from "@ynab-plus/domain";

export class CompareBalanceService extends AbstractApplicationService<"CompareBalanceCommand"> {
  public override readonly commandName = "CompareBalanceCommand";

  public override requiredPermissions: Permission[] = ["admin", "user"];

  public constructor(
    @inject("BankConnectionRepository")
    private bankConnectionRepo: IBankConnectionRepository,

    @inject("AccountRepository")
    private accountRepository: IAccountRepository,

    @inject("OpenBankingAccountBalanceFetcher")
    private balanceFetcher: IOpenBankingAccountBalanceFetcher,

    @inject("OpenBankingTokenManager")
    private tokenRepo: OpenBankingTokenManager,

    @inject("Logger")
    logger: ILogger,
  ) {
    super(logger);
  }

  protected override async handle<TRole extends IRole = User>({
    command: {
      data: { id },
    },
  }: IHandleContext<"CompareBalanceCommand", TRole>): Promise<
    | { status: "no_link" }
    | { status: "no_bank_connection" }
    | { status: "balances_match"; balance: number }
    | { status: "balance_mismatch"; ynabBalance: number; bankBalance: number }
  > {
    const connectionPromise = this.bankConnectionRepo.getConnection(this.currentUser.id);

    const accountPromise = this.accountRepository.getAccounts(id);

    const tokenPromise = this.tokenRepo.getToken(this.currentUser.id);

    if (!(await connectionPromise)) {
      return { status: "no_bank_connection" };
    }

    const account = await accountPromise;

    if (!account) {
      throw new AppError("Service was called with invalid account id");
    }

    if (!account.linkedOpenBankingAccount) {
      return { status: "no_link" };
    }

    const bankBalance = await this.balanceFetcher.getAccountBalance(
      account.linkedOpenBankingAccount,
      await tokenPromise,
    );

    if (bankBalance === account.clearedBalance) {
      return { status: "balances_match", balance: bankBalance };
    }

    return {
      status: "balance_mismatch",
      ynabBalance: account.clearedBalance,
      bankBalance,
    };
  }
}
