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
  ITaskScheduler,
  ITransactionFetcher,
  ITransactionRepository,
  NewTokenRequesterFactory,
} from "@ports";
import type { IBootstrapper, ILogger } from "@ynab-plus/bootstrap";
import type { IUser, SyncDetails, User } from "@ynab-plus/domain";

export interface IInfrastructurePorts {
  logger: ILogger;
  bootstrapper: IBootstrapper;
  eventBus: IEventBus;
  taskScheduler: ITaskScheduler;
  passwordHasher: IPasswordHasher;
  passwordVerifier: IPasswordVerifier;
  accountsRepository: IAccountRepository;
  sessionStorage: IObjectStorage<IUser & { $type: "user" }>;
  userRepository: IRepository<User> & IMultipleRepository<User>;
  oauthTokenRepository: IOauthTokenRepository;
  newTokenRequesterFactory: NewTokenRequesterFactory;
  oauthCheckerFactory: IOauthCheckerFactory;
  accountsFetcher: IAccountsFetcher;
  syncDetailsRepo: IRepository<SyncDetails>;
  transactionFetcher: ITransactionFetcher;
  transactionRepository: ITransactionRepository;
}
