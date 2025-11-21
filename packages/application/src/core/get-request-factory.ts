import { ServiceBus, SessionStorage } from "@core";
import type {
  IAccountRepository,
  IAccountsFetcher,
  IEventBus,
  IMultipleRepository,
  IOauthCheckerFactory,
  IOauthTokenRepository,
  IObjectStorage,
  IPasswordHasher,
  IPasswordVerifier,
  IRepository,
  ISessionIdRequester,
  ITaskScheduler,
  ITransactionFetcher,
  ITransactionRepository,
  NewTokenRequesterFactory,
  RequestScopedServiceBusFactory,
} from "@ports";
import { getServices } from "@services";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { SyncDetails, User } from "@ynab-plus/domain";
import { getUserSettingServices } from "src/services/get-user-setting-services.ts";

const LOG_CONTEXT = { context: "request-factory" };

interface IRequestFactoryConfig {
  logger: ILogger;
  sessionStorage: IObjectStorage;
  oauthTokenRepository: IOauthTokenRepository;
  taskScheduler: ITaskScheduler;
  passwordVerifier: IPasswordVerifier;
  passwordHasher: IPasswordHasher;
  oauthCheckerFactory: IOauthCheckerFactory;
  accountsRepository: IAccountRepository;
  newTokenRequesterFactory: NewTokenRequesterFactory;
  userRepository: IRepository<User> & IMultipleRepository<User>;
  accountsFetcher: IAccountsFetcher;
  syncdetailsRepository: IRepository<SyncDetails>;
  transactionFetcher: ITransactionFetcher;
  transactionRepository: ITransactionRepository;
  eventBus: IEventBus;
}

export const getRequestFactory = ({
  logger,
  sessionStorage,
  userRepository,
  newTokenRequesterFactory,
  oauthTokenRepository,
  taskScheduler,
  oauthCheckerFactory,
  syncdetailsRepository,
  accountsRepository,
  accountsFetcher,
  transactionFetcher,
  transactionRepository,
  passwordHasher,
  passwordVerifier,
  eventBus,
}: IRequestFactoryConfig): RequestScopedServiceBusFactory => {
  return async ({
    sessionIdRequester,
  }: {
    sessionIdRequester: ISessionIdRequester;
  }) => {
    logger.silly(`Starting request factory`, LOG_CONTEXT);

    const currentUserCache = new SessionStorage(
      sessionStorage,
      sessionIdRequester,
      logger,
    );

    const userSettingServices = getUserSettingServices({
      userRepository,
      logger,
      currentUserSetter: currentUserCache,
      passwordHasher,
      passwordVerifier,
    });

    const sessionId = await sessionIdRequester.getSessionId();
    logger.silly(`Child bus created with session id ${sessionId}`, LOG_CONTEXT);

    const childBus = eventBus.child(await sessionIdRequester.getSessionId());
    const services = getServices({
      eventBus: childBus,
      userRepository,
      oauthCheckerFactory,
      syncdetailsRepository,
      oauthTokenRepository,
      taskScheduler,
      passwordHasher,
      passwordVerifier,
      transactionFetcher,
      transactionRepository,
      newTokenRequesterFactory,
      accountsRepository,
      accountsFetcher,
      logger,
    });
    return {
      currentUserCache,
      serviceBus: new ServiceBus(
        [...services, ...userSettingServices],
        childBus,
        logger,
      ),
      eventBus: childBus,
    };
  };
};
