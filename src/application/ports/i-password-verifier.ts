export interface IPasswordVerifier {
  verify(password: string, hash: string): Promise<boolean>;
}
