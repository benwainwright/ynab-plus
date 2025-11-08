import { CommandHandler } from "@core";
import type { IHandleContext } from "@types";

export class LogoutCommandHandler extends CommandHandler<"Logout"> {
  public override readonly commandName = "Logout";

  public override async handle({
    session,
  }: IHandleContext<"Logout">): Promise<undefined> {
    await session.set({ userId: undefined });
  }
}
