export interface IPasswordVerifier {
  verifyPassword(password: string, hash: string): Promise<boolean>;
}
