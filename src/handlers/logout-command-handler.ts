import { CommandHandler } from "@core";
import type { IHandleContext } from "@types";
import { injectable } from "inversify";

@injectable()
export class LogoutCommandHandler extends CommandHandler<"Logout"> {
  public override readonly commandName = "Logout";

  public override async handle({
    session,
    eventBus,
  }: IHandleContext<"Logout">): Promise<undefined> {
    await session.set({ userId: undefined });

    eventBus.emit("LogoutSuccess", undefined);
  }
}
