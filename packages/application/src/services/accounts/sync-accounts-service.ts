import { inject, AbstractApplicationService } from "@core";
import {
  type IAccountRepository,
  type IAccountsFetcher,
  type IHandleContext,
  type ITaskScheduler
} from "@ports";
import type { OauthTokenManager } from "@services/oauth";
import { type ILogger } from "@ynab-plus/bootstrap";

import { RegularTask, type IRole } from "@ynab-plus/domain";
import { injectable } from "inversify";

const COOLOFF_WINDOW = 60 * 1000 * 5;

const LOG_CONTEXT = { context: "download-accounts-service" };

@injectable()
export class SyncAccountsService extends AbstractApplicationService<"SyncAccountsCommand"> {
  public constructor(
    @inject("OauthManager")
    private tokenManager: OauthTokenManager,

    @inject("AccountsFetcher")
    private accountsFetcher: IAccountsFetcher,

    @inject("AccountRepository")
    private accountsRepo: IAccountRepository,

    @inject("TaskScheduler")
    private taskScheduler: ITaskScheduler,

    @inject("Logger")
    logger: ILogger
  ) {
    super(logger);
  }

  public override readonly commandName = "SyncAccountsCommand";

  public override requiredPermissions: ("public" | "user" | "admin")[] = ["admin", "user"];

  protected override async handle<TRole extends IRole>({
    eventBus,
    command: {
      data: { force }
    }
  }: IHandleContext<"SyncAccountsCommand", TRole>) {
    eventBus.emit("AccountsSyncStarted", undefined);
    try {
      this.logger.debug(`Initiating accounts download`, LOG_CONTEXT);

      this.logger.debug(`Getting token from repo`, LOG_CONTEXT);
      await using token = await this.tokenManager.getToken(this.currentUser.id, "ynab");

      if (token.lastUse && Date.now() < token.lastUse.getTime() + COOLOFF_WINDOW && !force) {
        this.logger.debug(
          `Token was used recently or force wasn't passed. Skipping sync`,
          LOG_CONTEXT
        );
        return { synced: false };
      }

      this.logger.debug(`Fetching accounts`, LOG_CONTEXT);
      const storedAccountsPromise = this.accountsRepo.getUserAccounts(this.currentUser.id);
      const fetchedAccountsPromise = this.accountsFetcher.getAccounts(token);

      const [storedAccounts, fetchedAccounts] = await Promise.all([
        storedAccountsPromise,
        fetchedAccountsPromise
      ]);

      await Promise.all(
        fetchedAccounts.map(async (theFetchedAccount) => {
          const foundStored = storedAccounts.find((account) => account.id === theFetchedAccount.id);

          if (!foundStored) {
            const downloadTask = RegularTask.create({
              id: `${this.currentUser.id}-${theFetchedAccount.id}-tx-sync`,
              onBehalfOf: this.currentUser.id,
              triggerImmediately: true,
              lastExecution: undefined,
              minute: "*/10",
              hour: "*",
              data: `{ "id":"${theFetchedAccount.id}" }`,
              day: "*",
              month: "*",
              weekDay: "*",
              name: "Download transactions",
              description: "Keeps account transactions in sync",
              command: "SyncAccountCommand"
            });

            await this.taskScheduler.scheduleTask(downloadTask);
          }
        })
      );

      this.logger.debug(`Saving accounts into repo`, LOG_CONTEXT);
      await this.accountsRepo.saveAccounts(fetchedAccounts);
      eventBus.emit("AccountsSynced", fetchedAccounts);

      return { synced: true };
    } finally {
      eventBus.emit("AccountsSyncFinished", undefined);
    }
  }
}
