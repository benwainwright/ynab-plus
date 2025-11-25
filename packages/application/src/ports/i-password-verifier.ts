export interface IPasswordVerifier {
  verify(password: string, hash: string): Promise<boolean>;
}

export const PasswordVerifierToken = Symbol.for("PasswordVerifier");
