import { CommandHandler } from "@core";
import { userRepoToken } from "@tokens";
import type { IHandleContext, IRepository, IUser } from "@types";
import { inject, injectable } from "inversify";

@injectable()
export class GetUserCommandHandler extends CommandHandler<"GetUser"> {
  public override readonly commandName = "GetUser";

  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "admin",
    "public",
    "user",
  ];

  public constructor(
    @inject(userRepoToken)
    private users: IRepository<IUser>,
  ) {
    super();
  }

  public override async handle({
    command,
  }: IHandleContext<"GetUser">): Promise<IUser | undefined> {
    const { username } = command.data;

    return this.users.get(username);
  }
}
