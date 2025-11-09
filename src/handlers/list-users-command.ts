import { CommandHandler } from "@core";
import type { IHandleContext, IRepository, IUser } from "@types";
import { injectable } from "inversify";

@injectable()
export class ListUsersCommandHandler extends CommandHandler<"ListUsersCommand"> {
  public constructor(private users: IRepository<IUser>) {
    super();
  }

  public override readonly commandName = "ListUsersCommand";

  public override async handle({
    command,
  }: IHandleContext<"ListUsersCommand">): Promise<IUser[]> {
    const { offset, limit } = command.data;

    return await this.users.getMany(offset, limit);
  }
}
