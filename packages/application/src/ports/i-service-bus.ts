import type { Command, Commands } from "@ynab-plus/domain";

export interface IServiceBus {
  execute<TKey extends keyof Commands = keyof Commands>(
    command: Command<TKey>,
  ): Promise<Commands[TKey]["response"]>;
}
