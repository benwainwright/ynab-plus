import { CommandHandler } from "@core";
import type { ICommandMessage, IHandleContext } from "@types";

export class HelloWorldHandler extends CommandHandler<"HelloWorldCommand"> {
  public override readonly commandName = "HelloWorldCommand";

  public override async handle({
    command,
  }: IHandleContext<"HelloWorldCommand">) {
    return {
      hello: command.data.data,
    };
  }
}
