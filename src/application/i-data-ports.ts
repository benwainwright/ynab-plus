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
  passwordHasher: IPasswordHasher;
  passwordVerifier: IPasswordVerifier;
  userRepository: IRepository<User>;
  oauthTokenRepository: IOauthTokenRepository;
  sessionStorage: IObjectStorage;
  uuidGenerator: IUUIDGenerator;
  newTokenRequesterFactory: NewTokenRequesterFactory;
  oauthCheckerFactory: IOauthCheckerFactory;
}
