import type { ServiceIdentifier } from "inversify";

export interface IPasswordHasher {
  hash(password: string): Promise<string>;
}

export const PasswordHasherToken: ServiceIdentifier<IPasswordHasher> =
  Symbol.for("PasswordHasher");
