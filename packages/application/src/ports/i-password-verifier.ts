import type { ServiceIdentifier } from "inversify";

export interface IPasswordVerifier {
  verify(password: string, hash: string): Promise<boolean>;
}

export const PasswordVerifierToken: ServiceIdentifier<IPasswordVerifier> =
  Symbol.for("PasswordVerifier");
