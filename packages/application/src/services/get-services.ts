import type { AbstractApplicationService } from "@core";
import type {
  IAccountRepository,
  IAccountsFetcher,
  IMultipleRepository,
  IOauthCheckerFactory,
  IOauthTokenRepository,
  IPasswordHasher,
  IPasswordVerifier,
  IRepository,
  ITaskScheduler,
  ITransactionFetcher,
  ITransactionRepository,
  NewTokenRequesterFactory,
} from "@ports";

import { CheckOauthIntegrationStatusService } from "./oauth/check-oauth-integration-status-service.ts";
import { DisconnectOauthIntegrationService } from "./oauth/disconnect-oauth-integration-service.ts";
import { GenerateNewOauthTokenService } from "./oauth/generate-new-oauth-token-service.ts";
import { UpdateUserService } from "./users/update-user-service.ts";
import { ListUsersService } from "./users/list-users-service.ts";
import { GetUserService } from "./users/get-user-service.ts";
import { ListAccountsService } from "./accounts/list-accounts-service.ts";
import { SyncAccountsService } from "./accounts/sync-accounts-service.ts";
import { ListScheduledTasksService } from "./tasks/list-scheduled-tasks-service.ts";
import { UpdateScheduledTaskService } from "./tasks/update-scheduled-task-service.ts";

import type { ILogger } from "@ynab-plus/bootstrap";

import type { SyncDetails, User } from "@ynab-plus/domain";
import { SyncAccountService } from "./accounts/sync-account-service.ts";

interface IServiceDependencies {
  logger: ILogger;
  userRepository: IRepository<User> & IMultipleRepository<User>;
  oauthTokenRepository: IOauthTokenRepository;
  taskScheduler: ITaskScheduler;
  passwordVerifier: IPasswordVerifier;
  passwordHasher: IPasswordHasher;
  oauthCheckerFactory: IOauthCheckerFactory;
  accountsRepository: IAccountRepository;
  newTokenRequesterFactory: NewTokenRequesterFactory;
  accountsFetcher: IAccountsFetcher;
  syncDetailsRepo: IRepository<SyncDetails>;
  transactionFetcher: ITransactionFetcher;
  transactionRepository: ITransactionRepository;
}

export const getServices = ({
  userRepository,
  logger,
  newTokenRequesterFactory,
  oauthTokenRepository,
  taskScheduler,
  oauthCheckerFactory,
  passwordHasher,
  syncDetailsRepo,
  accountsRepository,
  accountsFetcher,
  transactionFetcher,
  transactionRepository,
}: IServiceDependencies): AbstractApplicationService[] => {
  return [
    new GetUserService(userRepository, logger),
    new ListUsersService(userRepository, logger),
    new UpdateUserService(userRepository, passwordHasher, logger),
    new DisconnectOauthIntegrationService(
      oauthTokenRepository,
      taskScheduler,
      logger,
    ),
    new CheckOauthIntegrationStatusService(
      oauthTokenRepository,
      oauthCheckerFactory,
      logger,
    ),
    new GenerateNewOauthTokenService(
      oauthTokenRepository,
      newTokenRequesterFactory,
      taskScheduler,
      logger,
    ),
    new SyncAccountsService(
      oauthTokenRepository,
      accountsFetcher,
      accountsRepository,
      logger,
    ),
    new ListAccountsService(accountsRepository, logger),
    new ListScheduledTasksService(taskScheduler, logger),
    new SyncAccountService(
      syncDetailsRepo,
      oauthTokenRepository,
      transactionFetcher,
      transactionRepository,
      logger,
    ),
    new UpdateScheduledTaskService(taskScheduler, logger),
  ];
};
