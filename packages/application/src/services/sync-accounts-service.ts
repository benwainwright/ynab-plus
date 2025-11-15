import { AppError } from "@errors";
import type {
  IAccountRepository,
  IAccountsFetcher,
  IHandleContext,
  IOauthTokenRepository,
} from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";

import { AbstractApplicationService } from "./abstract-application-service.ts";

const COOLOFF_WINDOW = 60 * 1000 * 5;

const LOG_CONTEXT = { context: "download-accounts-service" };

export class SyncAccountsService extends AbstractApplicationService<"SyncAccountsCommand"> {
  public constructor(
    private tokenRepository: IOauthTokenRepository,
    private accountsFetcher: IAccountsFetcher,
    private accountsRepo: IAccountRepository,
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "SyncAccountsCommand";

  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "admin",
    "user",
  ];

  protected override async handle({
    command: {
      data: { force },
    },
    currentUserCache,
  }: IHandleContext<"SyncAccountsCommand">) {
    this.logger.debug(`Initiating accounts download`, LOG_CONTEXT);

    const user = await currentUserCache.require();

    this.logger.debug(`Getting token from repo`, LOG_CONTEXT);
    const token = await this.tokenRepository.get(user.id, "ynab");

    if (!token) {
      throw new AppError(`No token found for ynab`);
    }

    if (Date.now() < token.lastUse.getTime() + COOLOFF_WINDOW && !force) {
      return { synced: false };
    }

    this.logger.debug(`Fetching accounts`, LOG_CONTEXT);
    const accounts = await this.accountsFetcher.getAccounts(token);

    this.logger.debug(`Saving accounts into repo`, LOG_CONTEXT);
    await this.accountsRepo.saveAccounts(accounts);
    await this.tokenRepository.save(token);

    return { synced: true };
  }
}
