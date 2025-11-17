import type { Commands } from "./commands.ts";
import type { IRole } from "./i-role.ts";
import { User } from "./user.ts";

export class Command<
  TKey extends keyof Commands = keyof Commands,
  TRole extends IRole = User,
> {
  public constructor(
    public readonly key: TKey,
    public readonly data: Commands[TKey]["request"],
    public readonly role: TRole | undefined,
  ) {}
}
