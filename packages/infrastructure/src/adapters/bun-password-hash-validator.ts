import type { IPasswordHasher, IPasswordVerifier } from "@ynab-plus/app";

export class BunPasswordHashValidator
  implements IPasswordHasher, IPasswordVerifier
{
  async hash(password: string): Promise<string> {
    return await Bun.password.hash(password);
  }
  async verify(password: string, hash: string): Promise<boolean> {
    return await Bun.password.verify(password, hash);
  }
}
