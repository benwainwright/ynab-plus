import type {
  IAccountRepository,
  IAccountsFetcher,
  IEventBus,
  IMultipleRepository,
  IOauthCheckerFactory,
  IOauthTokenRepository,
  IBankConnectionCreator,
  IBankConnectionRepository,
  IObjectStorage,
  IPasswordVerifier,
  IRepository,
  ITaskScheduler,
  ITransactionFetcher,
  ITransactionRepository,
  NewTokenRequesterFactory,
  IInstitutionAuthPageLinkFetcher,
  IStringHasher,
} from "@ports";
import type { IBootstrapper, ILogger } from "@ynab-plus/bootstrap";
import type { SyncDetails, User } from "@ynab-plus/domain";

export interface IInfrastructurePorts {
  logger: ILogger;
  bootstrapper: IBootstrapper;
  eventBus: IEventBus;
  taskScheduler: ITaskScheduler;
  bankLinkFetcher: IInstitutionAuthPageLinkFetcher;
  bankConnectionCreator: IBankConnectionCreator;
  bankConnectionRepository: IBankConnectionRepository;
  passwordHasher: IStringHasher;
  passwordVerifier: IPasswordVerifier;
  accountsRepository: IAccountRepository;
  sessionStorage: IObjectStorage;
  userRepository: IRepository<User> & IMultipleRepository<User>;
  oauthTokenRepository: IOauthTokenRepository;
  newTokenRequesterFactory: NewTokenRequesterFactory;
  oauthCheckerFactory: IOauthCheckerFactory;
  accountsFetcher: IAccountsFetcher;
  syncdetailsRepository: IRepository<SyncDetails>;
  transactionFetcher: ITransactionFetcher;
  transactionRepository: ITransactionRepository;
}
