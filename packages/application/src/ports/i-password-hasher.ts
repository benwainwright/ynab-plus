export interface IPasswordHasher {
  hash(password: string): Promise<string>;
}

export const PasswordHasherToken = Symbol.for("PasswordHasher");
