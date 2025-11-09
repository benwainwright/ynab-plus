import type { ICommandMessage } from "./i-command-message.ts";
import type { IHandleContext } from "./i-handle-context.ts";

export interface ICommandHandler<TKey extends keyof Commands> {
  readonly commandName: TKey;

  canHandle(
    command: ICommandMessage<keyof Commands>,
  ): command is ICommandMessage<TKey>;

  handle(context: IHandleContext<TKey>): Promise<Commands[TKey]["response"]>;
}
