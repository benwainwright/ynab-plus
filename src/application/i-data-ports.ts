import type { User } from "@domain";

import type {
  IOauthCheckerFactory,
  IOauthTokenRepository,
  IObjectStorage,
  IPasswordHasher,
  IPasswordVerifier,
  IRepository,
  IUUIDGenerator,
  NewTokenRequesterFactory,
} from "@application/ports";

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
