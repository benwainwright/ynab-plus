import { CommandHandler } from "@core";
import type { ICommandMessage, IEventBus } from "@types";

export class ListTransationsHandler extends CommandHandler<"ListTransactionsCommand"> {
  public override readonly commandName = "ListTransactionsCommand";

  public override handle(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
