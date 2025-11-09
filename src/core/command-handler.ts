import type { IHandleContext, ICommandMessage } from "@types";

export abstract class CommandHandler<TKey extends keyof Commands> {
  public constructor() {}

  public abstract readonly commandName: TKey;

  public canHandle(
    command: ICommandMessage<keyof Commands>,
  ): command is ICommandMessage<TKey> {
    return command.key === this.commandName;
  }

  public abstract handle(
    context: IHandleContext<TKey>,
  ): Promise<Commands[TKey]["response"]>;
}

export interface ICommandHandler<TKey extends keyof Commands> {
  readonly commandName: TKey;

  canHandle(
    command: ICommandMessage<keyof Commands>,
  ): command is ICommandMessage<TKey>;

  handle(context: IHandleContext<TKey>): Promise<Commands[TKey]["response"]>;
}
