import type { Command, Commands } from "@ynab-plus/domain";

export interface IServiceBus {
  handleCommand<TKey extends keyof Commands>(
    command: Command,
  ): Promise<Commands[TKey]["response"]>;
}
