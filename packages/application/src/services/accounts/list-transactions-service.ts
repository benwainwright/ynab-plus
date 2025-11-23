import { AbstractApplicationService } from "@core";
import { AppError } from "@errors";
import type {
  IAccountRepository,
  IHandleContext,
  ITransactionRepository,
} from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { IRole, User, Transaction, Permission } from "@ynab-plus/domain";

export class ListTransactionsService extends AbstractApplicationService<"ListTransactionsCommand"> {
  public constructor(
    private transactionsRepo: ITransactionRepository,
    private accountsRepo: IAccountRepository,
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "ListTransactionsCommand";

  public override requiredPermissions: Permission[] = ["admin", "user"];

  protected override async handle<TRole extends IRole = User>({
    command: {
      data: { accountId, offset, limit },
    },
  }: IHandleContext<"ListTransactionsCommand", TRole>): Promise<{
    transactions: Transaction[];
    count: number;
  }> {
    const theAccount = await this.accountsRepo.getAccounts(accountId);

    if (theAccount?.userId !== this.currentUser.id) {
      throw new AppError(
        `Can only list transactions for accounts owned by you`,
      );
    }

    const txPromise = this.transactionsRepo.getAccountTransactions(
      this.currentUser.id,
      accountId,
      offset,
      limit,
    );

    const countPromise = this.transactionsRepo.getAccountTransactionCount(
      this.currentUser.id,
      accountId,
    );

    const [transactions, count] = await Promise.all([txPromise, countPromise]);

    return {
      transactions,
      count,
    };
  }
}
