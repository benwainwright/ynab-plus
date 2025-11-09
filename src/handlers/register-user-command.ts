import { CommandHandler } from "@core";
import { userRepoToken } from "@tokens";
import type { IHandleContext, IRepository, IUser } from "@types";
import { inject, injectable } from "inversify";

@injectable()
export class RegisterCommandHandler extends CommandHandler<"RegisterCommand"> {
  public override readonly commandName = "RegisterCommand";

  public constructor(
    @inject(userRepoToken)
    private users: IRepository<IUser>,
  ) {
    super();
  }

  public override async handle({
    command,
    session,
    eventBus,
  }: IHandleContext<"RegisterCommand">) {
    const { password, username, email } = command.data;

    const hash = await Bun.password.hash(password);

    await this.users.save({
      id: username,
      email,
      passwordHash: hash,
      permissions: ["user"],
    });
    await session.set({ userId: username });

    eventBus.emit("RegisterSuccess", undefined);
    return { success: true, id: username };
  }
}
