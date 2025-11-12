import type { Commands } from "@ynab-plus/domain";

import type { ICommandMessage } from "./i-command-message.ts";

export interface IServiceBus {
  handleCommand<TKey extends keyof Commands>(
    command: ICommandMessage<keyof Commands>,
  ): Promise<Commands[TKey]["response"]>;
}
