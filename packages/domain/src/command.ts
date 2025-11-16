import type { Commands } from "./commands.ts";

export class Command<TKey extends keyof Commands = keyof Commands> {
  public constructor(
    public readonly key: TKey,
    public readonly data: Commands[TKey]["request"],
  ) {}
}
