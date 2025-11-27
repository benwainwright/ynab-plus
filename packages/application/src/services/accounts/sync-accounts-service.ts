import { $inject, AbstractApplicationService } from "@core";
import { AppError } from "@errors";
import {
  AccountRepositoryToken,
  OauthTokenRepositoryToken,
  TaskSchedulerToken,
  type IAccountRepository,
  type IAccountsFetcher,
  type IHandleContext,
  type IOauthTokenRepository,
  type ITaskScheduler,
} from "@ports";
import { LoggerToken, type ILogger } from "@ynab-plus/bootstrap";

import { RegularTask, type IRole } from "@ynab-plus/domain";
import { inject, injectable } from "inversify";

const COOLOFF_WINDOW = 60 * 1000 * 5;

const LOG_CONTEXT = { context: "download-accounts-service" };

@injectable()
export class SyncAccountsService extends AbstractApplicationService<"SyncAccountsCommand"> {
  public constructor(
    @inject(OauthTokenRepositoryToken)
    private tokenRepository: IOauthTokenRepository,

    @$inject("AccountsFetcher")
    private accountsFetcher: IAccountsFetcher,

    @inject(AccountRepositoryToken)
    private accountsRepo: IAccountRepository,

    @inject(TaskSchedulerToken)
    private taskScheduler: ITaskScheduler,

    @inject(LoggerToken)
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "SyncAccountsCommand";

  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "admin",
    "user",
  ];

  protected override async handle<TRole extends IRole>({
    eventBus,
    command: {
      data: { force },
    },
  }: IHandleContext<"SyncAccountsCommand", TRole>) {
    this.logger.debug(`Initiating accounts download`, LOG_CONTEXT);

    this.logger.debug(`Getting token from repo`, LOG_CONTEXT);
    const token = await this.tokenRepository.get(this.currentUser.id, "ynab");

    if (!token) {
      throw new AppError(`No token found for ynab`);
    }

    if (
      token.lastUse &&
      Date.now() < token.lastUse.getTime() + COOLOFF_WINDOW &&
      !force
    ) {
      this.logger.debug(
        `Token was used recently or force wasn't passed. Skipping sync`,
        LOG_CONTEXT,
      );
      return { synced: false };
    }

    this.logger.debug(`Fetching accounts`, LOG_CONTEXT);
    const storedAccountsPromise = this.accountsRepo.getUserAccounts(
      this.currentUser.id,
    );
    const fetchedAccountsPromise = this.accountsFetcher.getAccounts(token);

    const [storedAccounts, fetchedAccounts] = await Promise.all([
      storedAccountsPromise,
      fetchedAccountsPromise,
    ]);

    await Promise.all(
      fetchedAccounts.map(async (theFetchedAccount) => {
        const foundStored = storedAccounts.find(
          (account) => account.id === theFetchedAccount.id,
        );

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
            command: "SyncAccountCommand",
          });

          await this.taskScheduler.scheduleTask(downloadTask);
        }
      }),
    );

    this.logger.debug(`Saving accounts into repo`, LOG_CONTEXT);
    await this.accountsRepo.saveAccounts(fetchedAccounts);
    await this.tokenRepository.save(token);
    eventBus.emit("AccountsSynced", fetchedAccounts);

    return { synced: true };
  }
}
