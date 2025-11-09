import { CommandHandler } from "@core";
import type { IHandleContext, IRepository, IUser } from "@types";
import { injectable } from "inversify";

@injectable()
export class LoginCommandHandler extends CommandHandler<"LoginCommand"> {
  public constructor(private users: IRepository<IUser>) {
    super();
  }

  public override readonly commandName = "LoginCommand";

  public override async handle({
    command,
    session,
    eventBus,
  }: IHandleContext<"LoginCommand">): Promise<
    Commands["LoginCommand"]["response"]
  > {
    const { username, password } = command.data;

    const user = await this.users.get(username);

    if (user && (await Bun.password.verify(password, user.passwordHash))) {
      await session.set({ userId: username });
      eventBus.emit("LoginSuccess", undefined);
      return { success: true, id: username };
    }
    eventBus.emit("LoginFail", undefined);
    return { success: false };
  }
}
