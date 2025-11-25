import { AbstractApplicationService } from "@core";
import {
  OauthTokenRepositoryToken,
  SyncDetailsRepositoryToken,
  TransactionFetcherToken,
  TransactionRepositoryToken,
  type IHandleContext,
  type IOauthTokenRepository,
  type IRepository,
  type ITransactionFetcher,
} from "@ports";
import { LoggerToken, type ILogger } from "@ynab-plus/bootstrap";
import {
  SyncDetails,
  type IRole,
  type Permission,
  type User,
} from "@ynab-plus/domain";
import { inject, injectable } from "inversify";

import type { ITransactionRepository } from "src/ports/i-transaction-repository.ts";

export const LOG_CONTEXT = { context: "sync-account-service" };

@injectable()
export class SyncAccountService extends AbstractApplicationService<"SyncAccountCommand"> {
  public override readonly commandName = "SyncAccountCommand";

  public constructor(
    @inject(SyncDetailsRepositoryToken)
    private syncDetailsRepo: IRepository<SyncDetails>,

    @inject(OauthTokenRepositoryToken)
    private oauthTokenRepository: IOauthTokenRepository,

    @inject(TransactionFetcherToken)
    private transactionFetcher: ITransactionFetcher,

    @inject(TransactionRepositoryToken)
    private transactionRepository: ITransactionRepository,

    @inject(LoggerToken)
    logger: ILogger,
  ) {
    super(logger);
  }

  public override requiredPermissions: Permission[] = [
    "system",
    "user",
    "admin",
  ];

  protected override async handle<TRole extends IRole = User>({
    eventBus,
    command: {
      data: { id },
    },
  }: IHandleContext<"SyncAccountCommand", TRole>): Promise<
    { success: true } | { success: false; reason: string }
  > {
    eventBus.emit("AccountSyncStarted", { accountId: id });
    try {
      this.logger.silly(`Starting get accounts service`, LOG_CONTEXT);
      const tokenPromise = this.oauthTokenRepository.get(
        this.currentUser.id,
        "ynab",
      );

      const syncDetailsPromise = this.syncDetailsRepo.get(
        `ynab-account-sync-${id}`,
      );

      const [token, syncDetails] = await Promise.all([
        tokenPromise,
        syncDetailsPromise,
      ]);

      const theSyncDetails =
        syncDetails ??
        SyncDetails.create({
          provider: "ynab",
          id: `ynab-account-sync-${id}`,
        });

      if (!token) {
        return {
          success: false,
          reason: `Token for ynab could not be found`,
        } as const;
      }

      this.logger.silly(`Fetching transactions`, LOG_CONTEXT);

      const transactions = await this.transactionFetcher.getAccountTransactions(
        token,
        id,
        theSyncDetails,
      );
      this.logger.silly(
        `Fetched ${String(transactions.length)} transactions!`,
        LOG_CONTEXT,
      );

      await this.transactionRepository.saveTransactions(transactions);
      await this.syncDetailsRepo.save(theSyncDetails);
      return { success: true } as const;
    } finally {
      eventBus.emit("AccountSyncFinished", { accountId: id });
    }
  }
}
