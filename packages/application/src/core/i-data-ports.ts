import type {
  IAccountRepository,
  IAccountsFetcher,
  IEventBus,
  IOauthCheckerFactory,
  IOauthTokenRepository,
  IObjectStorage,
  IPasswordHasher,
  IPasswordVerifier,
  IRepository,
  ITaskScheduler,
  IUUIDGenerator,
  NewTokenRequesterFactory,
} from "@ports";
import type { IBootstrapper, ILogger } from "@ynab-plus/bootstrap";
import type { IUser, User } from "@ynab-plus/domain";

export interface IInfrastructurePorts {
  logger: ILogger;
  bootstrapper: IBootstrapper;
  eventBus: IEventBus;
  taskScheduler: ITaskScheduler;
  uuidGenerator: IUUIDGenerator;
  passwordHasher: IPasswordHasher;
  passwordVerifier: IPasswordVerifier;
  accountsRepository: IAccountRepository;
  accountsFetcher: IAccountsFetcher;
  sessionStorage: IObjectStorage<IUser & { $type: "user" }>;
  userRepository: IRepository<User>;
  oauthTokenRepository: IOauthTokenRepository;
  newTokenRequesterFactory: NewTokenRequesterFactory;
  oauthCheckerFactory: IOauthCheckerFactory;
}
