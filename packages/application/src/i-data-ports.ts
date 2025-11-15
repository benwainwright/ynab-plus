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
  IUUIDGenerator,
  NewTokenRequesterFactory,
} from "@ports";
import type { User } from "@ynab-plus/domain";

export interface IInfrastructurePorts {
  messaging: {
    eventBus: IEventBus;
  };
  misc: {
    uuidGenerator: IUUIDGenerator;
  };
  auth: {
    passwordHasher: IPasswordHasher;
    passwordVerifier: IPasswordVerifier;
  };
  data: {
    accountsRepo: IAccountRepository;
    accountsFetcher: IAccountsFetcher;
    sessionStorage: IObjectStorage<User>;
    userRepository: IRepository<User>;
  };
  oauth: {
    oauthTokenRepository: IOauthTokenRepository;
    newTokenRequesterFactory: NewTokenRequesterFactory;
    oauthCheckerFactory: IOauthCheckerFactory;
  };
}
