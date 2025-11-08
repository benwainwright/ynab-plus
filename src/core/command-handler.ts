import type { IEventBus, IHandleContext, ISessionData } from "@types";
import type { ICommandMessage } from "../types/i-command-message.ts";
import type { SessionStorage } from "./session-storage.ts";

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
