import type { IPasswordHasher, IPasswordVerifier } from "@ynab-plus/app";
import bcyrpt from "bcrypt";

export class NodePasswordHashValidator
  implements IPasswordHasher, IPasswordVerifier
{
  async hash(password: string): Promise<string> {
    const salt = await bcyrpt.genSalt();
    return await bcyrpt.hash(password, salt);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return await bcyrpt.compare(password, hash);
  }
}
