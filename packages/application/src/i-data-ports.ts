import type { ILogger } from "@ynab-plus/bootstrap";
import type { User } from "@ynab-plus/domain";

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
    sessionStorage: IObjectStorage;
    userRepository: IRepository<User>;
  };
  oauth: {
    oauthTokenRepository: IOauthTokenRepository;
    newTokenRequesterFactory: NewTokenRequesterFactory;
    oauthCheckerFactory: IOauthCheckerFactory;
  };
}
