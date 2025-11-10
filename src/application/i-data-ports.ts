import type { User } from "@domain";

import type {
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
  sessionStorage: IObjectStorage;
  uuidGenerator: IUUIDGenerator;
}
