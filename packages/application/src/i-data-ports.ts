import type { User } from "@ynab-plus/domain";

import type {
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
