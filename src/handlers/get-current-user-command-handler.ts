import { CommandHandler } from "@core";
import { userRepoToken } from "@tokens";
import type { IHandleContext, IRepository, IUser } from "@types";
import { inject, injectable } from "inversify";

@injectable()
export class GetCurrentUserCommandHandler extends CommandHandler<"GetCurrentUser"> {
  public override readonly commandName = "GetCurrentUser";

  public constructor(
    @inject(userRepoToken)
    private users: IRepository<IUser>,
  ) {
    super();
  }

  public override async handle({
    session,
  }: IHandleContext<"GetCurrentUser">): Promise<IUser | undefined> {
    const id = await session.get();

    if (id?.userId) {
      const user = this.users.get(id.userId);
      return user;
    }

    return undefined;
  }
}
