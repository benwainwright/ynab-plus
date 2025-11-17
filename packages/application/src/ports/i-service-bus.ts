import type { Command, Commands, IRole, User } from "@ynab-plus/domain";

export interface IServiceBus {
  execute<
    TKey extends keyof Commands = keyof Commands,
    TRole extends IRole = User,
  >(
    command: Command<TKey, TRole>,
  ): Promise<Commands[TKey]["response"]>;
}
