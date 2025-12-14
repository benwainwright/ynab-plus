import { AbstractApplicationService, inject } from "@core";
import { AppError } from "@errors";
import type {
  IAccountRepository,
  IBankConnectionRepository,
  IHandleContext,
  IOauthTokenRepository,
  IOpenBankingAccountBalanceFetcher,
} from "@ports";
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

    @inject("OauthTokenRepository")
    private tokenRepo: IOauthTokenRepository,

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

    const tokenPromise = this.tokenRepo.get(this.currentUser.id, "open-banking");

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

    const token = await tokenPromise;

    if (!token) {
      throw new AppError("Service was called without an active open banking token");
    }

    const bankBalance = await this.balanceFetcher.getAccountBalance(
      account.linkedOpenBankingAccount,
      token,
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
