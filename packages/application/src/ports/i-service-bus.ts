import type { Commands, ICommandMessage } from "@ynab-plus/domain";

export interface IServiceBus {
  handleCommand<TKey extends keyof Commands>(
    command: ICommandMessage,
  ): Promise<Commands[TKey]["response"]>;
}
