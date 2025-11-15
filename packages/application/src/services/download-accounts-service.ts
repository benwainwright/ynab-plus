import { AppError } from "@errors";
import type {
  IAccountRepository,
  IAccountsFetcher,
  IHandleContext,
  IOauthTokenRepository,
} from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";

import { AbstractApplicationService } from "./abstract-application-service.ts";

const LOG_CONTEXT = { context: "download-accounts-service" };

export class DownloadAccountsService extends AbstractApplicationService<"DownloadAccountsCommand"> {
  public constructor(
    private tokenRepository: IOauthTokenRepository,
    private accountsFetcher: IAccountsFetcher,
    private accountsRepo: IAccountRepository,
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "DownloadAccountsCommand";

  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "admin",
    "user",
  ];

  protected override async handle({
    currentUserCache,
  }: IHandleContext<"DownloadAccountsCommand">): Promise<undefined> {
    this.logger.debug(`Initiating accounts download`, LOG_CONTEXT);

    const user = await currentUserCache.require();

    this.logger.debug(`Getting token from repo`, LOG_CONTEXT);
    const token = await this.tokenRepository.get(user.id, "ynab");

    if (!token) {
      throw new AppError(`No token found for ynab`);
    }

    this.logger.debug(`Fetching accounts`, LOG_CONTEXT);
    const accounts = await this.accountsFetcher.getAccounts(token);

    this.logger.debug(`Saving accounts into repo`, LOG_CONTEXT);
    await this.accountsRepo.saveAccounts(accounts);
  }
}
