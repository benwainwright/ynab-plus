import { CommandHandler } from "@core";
import type { IHandleContext, IRepository, IUser } from "@types";

export class RegisterCommandHandler extends CommandHandler<"RegisterCommand"> {
  public override readonly commandName = "RegisterCommand";

  public constructor(private users: IRepository<IUser>) {
    super();
  }

  public override async handle({
    command,
    session,
  }: IHandleContext<"RegisterCommand">) {
    const { password, username, email } = command.data;

    const hash = await Bun.password.hash(password);
    const id = Bun.randomUUIDv7();

    await this.users.save({
      id,
      email,
      username,
      passwordHash: hash,
    });
    await session.set({ userId: id });

    return { success: true, id };
  }
}
