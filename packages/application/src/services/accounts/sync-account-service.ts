import { AbstractApplicationService } from "@core";
import type {
  IHandleContext,
  IOauthTokenRepository,
  IRepository,
  ITransactionFetcher,
} from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import {
  SyncDetails,
  type IRole,
  type Permission,
  type User,
} from "@ynab-plus/domain";
import type { ITransactionRepository } from "src/ports/i-transaction-repository.ts";

export class SyncAccountService extends AbstractApplicationService<"SyncAccountCommand"> {
  public override readonly commandName = "SyncAccountCommand";

  public constructor(
    private syncDetailsRepo: IRepository<SyncDetails>,
    private oauthTokenRepository: IOauthTokenRepository,
    private transactionFetcher: ITransactionFetcher,
    private transactionRepository: ITransactionRepository,
    logger: ILogger,
  ) {
    super(logger);
  }

  public override requiredPermissions: Permission[] = ["system"];

  protected override async handle<TRole extends IRole = User>({
    command: {
      data: { id },
    },
  }: IHandleContext<"SyncAccountCommand", TRole>): Promise<
    { success: true } | { success: false; reason: string }
  > {
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
      new SyncDetails({
        provider: "ynab",
        id: `ynab-account-sync-${id}`,
        checkpoint: undefined,
        lastSync: new Date(),
      });

    if (!token) {
      return {
        success: false,
        reason: `Token for ynab could not be found`,
      } as const;
    }

    const transactions = await this.transactionFetcher.getAccountTransactions(
      token,
      id,
      theSyncDetails,
    );

    await this.transactionRepository.saveAccountTransactions(id, transactions);
    await this.syncDetailsRepo.save(theSyncDetails);

    return { success: true } as const;
  }
}
