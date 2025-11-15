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
import type { IUser, User } from "@ynab-plus/domain";

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
    sessionStorage: IObjectStorage<IUser & { $type: "user" }>;
    userRepository: IRepository<User>;
    oauthTokenRepository: IOauthTokenRepository;
  };
  oauth: {
    newTokenRequesterFactory: NewTokenRequesterFactory;
    oauthCheckerFactory: IOauthCheckerFactory;
  };
}
