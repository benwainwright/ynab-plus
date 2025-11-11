import type { User } from "@domain";

import type {
  IOauthTokenRepository,
  IObjectStorage,
  IPasswordHasher,
  IPasswordVerifier,
  IRepository,
  IUUIDGenerator,
} from "./ports/index.ts";

export interface IInfrastructurePorts {
  passwordHasher: IPasswordHasher;
  passwordVerifier: IPasswordVerifier;
  userRepository: IRepository<User>;
  oauthTokenRepository: IOauthTokenRepository;
  sessionStorage: IObjectStorage;
  uuidGenerator: IUUIDGenerator;
}
