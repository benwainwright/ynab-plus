import type { Commands } from "./commands.ts";
import type { IRole } from "@core";
import type { User } from "@user";

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
