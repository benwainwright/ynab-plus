import type { Commands } from "./commands.ts";

export interface ICommandMessage<TKey extends keyof Commands = keyof Commands> {
  key: TKey;
  id: string;
  data: Commands[TKey]["request"];
}
