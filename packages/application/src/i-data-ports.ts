import type {
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
    sessionStorage: IObjectStorage<IUser>;
    userRepository: IRepository<User>;
  };
  oauth: {
    oauthTokenRepository: IOauthTokenRepository;
    newTokenRequesterFactory: NewTokenRequesterFactory;
    oauthCheckerFactory: IOauthCheckerFactory;
  };
}
