import { emitDomainEventsOnSave, type AbstractApplicationService } from "@core";
import type {
  IAccountRepository,
  IAccountsFetcher,
  IBankConnectionCreator,
  IBankConnectionRepository,
  IEventBus,
  IInstitutionAuthPageLinkFetcher,
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
import { ListTransactionsService } from "./accounts/list-transactions-service.ts";
import { CheckBankConnectionService } from "./open-banking/check-bank-connection-service.ts";
import { GetInstitutionAuthorizationPageLinkService } from "./open-banking/get-institution-authorization-page-link-service.ts";
import { GetUsersService } from "./users/get-users-service.ts";

interface IServiceDependencies {
  logger: ILogger;
  userRepository: IRepository<User> & IMultipleRepository<User>;
  bankConnectionCreator: IBankConnectionCreator;
  bankConnectionRepository: IBankConnectionRepository;
  oauthTokenRepository: IOauthTokenRepository;
  taskScheduler: ITaskScheduler;
  passwordVerifier: IPasswordVerifier;
  passwordHasher: IPasswordHasher;
  oauthCheckerFactory: IOauthCheckerFactory;
  accountsRepository: IAccountRepository;
  newTokenRequesterFactory: NewTokenRequesterFactory;
  authLinkFetcher: IInstitutionAuthPageLinkFetcher;
  accountsFetcher: IAccountsFetcher;
  syncdetailsRepository: IRepository<SyncDetails>;
  transactionFetcher: ITransactionFetcher;
  transactionRepository: ITransactionRepository;
  eventBus: IEventBus;
}

export const getServices = ({
  userRepository,
  logger,
  authLinkFetcher,
  newTokenRequesterFactory,
  bankConnectionCreator,
  oauthTokenRepository,
  taskScheduler,
  oauthCheckerFactory,
  passwordHasher,
  syncdetailsRepository,
  accountsRepository,
  accountsFetcher,
  transactionFetcher,
  transactionRepository,
  bankConnectionRepository,
  eventBus,
}: IServiceDependencies): AbstractApplicationService[] => {
  const bankConnections = emitDomainEventsOnSave(
    bankConnectionRepository,
    eventBus,
    "deleteConnection",
    "saveConnection",
  );

  const users = emitDomainEventsOnSave(userRepository, eventBus, "save");
  const tokens = emitDomainEventsOnSave(oauthTokenRepository, eventBus, "save");
  const transactions = emitDomainEventsOnSave(
    transactionRepository,
    eventBus,
    "saveTransaction",
    "getTransaction",
  );
  const tasks = emitDomainEventsOnSave(
    taskScheduler,
    eventBus,
    "deleteTask",
    "updateTask",
    "scheduleTask",
  );

  const accounts = emitDomainEventsOnSave(
    accountsRepository,
    eventBus,
    "deleteAccount",
    "saveAccount",
    "saveAccounts",
  );

  const syncDetails = emitDomainEventsOnSave(
    syncdetailsRepository,
    eventBus,
    "save",
    "delete",
  );

  return [
    new GetInstitutionAuthorizationPageLinkService(
      authLinkFetcher,
      bankConnections,
      logger,
    ),
    new CheckBankConnectionService(
      bankConnections,
      bankConnectionCreator,
      logger,
    ),
    new GetUserService(users, logger),
    new GetUsersService(users, logger),
    new ListUsersService(users, logger),
    new UpdateUserService(users, passwordHasher, logger),
    new DisconnectOauthIntegrationService(tokens, tasks, logger),
    new CheckOauthIntegrationStatusService(tokens, oauthCheckerFactory, logger),
    new ListTransactionsService(transactions, accounts, logger),
    new GenerateNewOauthTokenService(
      tokens,
      newTokenRequesterFactory,
      tasks,
      logger,
    ),
    new SyncAccountsService(tokens, accountsFetcher, accounts, tasks, logger),
    new ListAccountsService(accounts, logger),
    new ListScheduledTasksService(tasks, logger),
    new SyncAccountService(
      syncDetails,
      tokens,
      transactionFetcher,
      transactions,
      logger,
    ),
    new UpdateScheduledTaskService(tasks, logger),
  ];
};
