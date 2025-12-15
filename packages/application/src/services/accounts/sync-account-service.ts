import { inject, AbstractApplicationService } from "@core";

import {
  type IHandleContext,
  type IRepository,
  type ITransactionFetcher,
  type ITransactionRepository,
} from "@ports";
import { TokenWasNotFoundError, type OauthTokenManager } from "@services/oauth";

import { type ILogger } from "@ynab-plus/bootstrap";
import { SyncDetails, type IRole, type Permission, type User } from "@ynab-plus/domain";
import { injectable } from "inversify";

export const LOG_CONTEXT = { context: "sync-account-service" };

@injectable()
export class SyncAccountService extends AbstractApplicationService<"SyncAccountCommand"> {
  public override readonly commandName = "SyncAccountCommand";

  public constructor(
    @inject("SyncDetailsRepository")
    private syncDetailsRepo: IRepository<SyncDetails>,

    @inject("OauthManager")
    private tokenManager: OauthTokenManager,

    @inject("TransactionFetcher")
    private transactionFetcher: ITransactionFetcher,

    @inject("TransactionRepository")
    private transactionRepository: ITransactionRepository,

    @inject("Logger")
    logger: ILogger,
  ) {
    super(logger);
  }

  public override requiredPermissions: Permission[] = ["system", "user", "admin"];

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
      await using token = await this.tokenManager.getToken(this.currentUser.id, "ynab");

      const syncDetails = await this.syncDetailsRepo.get(`ynab-account-sync-${id}`);

      const theSyncDetails =
        syncDetails ??
        SyncDetails.create({
          provider: "ynab",
          id: `ynab-account-sync-${id}`,
        });

      this.logger.silly(`Fetching transactions`, LOG_CONTEXT);

      const transactions = await this.transactionFetcher.getAccountTransactions(
        token,
        id,
        theSyncDetails,
      );
      this.logger.silly(`Fetched ${String(transactions.length)} transactions!`, LOG_CONTEXT);

      await this.transactionRepository.saveTransactions(transactions);

      await this.syncDetailsRepo.save(theSyncDetails);
      return { success: true } as const;
    } catch (error) {
      if (error instanceof TokenWasNotFoundError) {
        return {
          success: false,
          reason: `Token for ynab could not be found`,
        } as const;
      }
      throw error;
    } finally {
      eventBus.emit("AccountSyncFinished", { accountId: id });
    }
  }
}
