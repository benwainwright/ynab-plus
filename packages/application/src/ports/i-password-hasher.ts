export interface IPasswordHasher {
  hashPassword(text: string): Promise<string>;
}
