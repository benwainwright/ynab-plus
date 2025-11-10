import { CommandHandler } from "@core";
import { AppError } from "@errors";
import { userRepoToken } from "@tokens";
import type { IHandleContext, IRepository, IUser } from "@types";
import { inject, injectable } from "inversify";

@injectable()
export class GetCurrentUserCommandHandler extends CommandHandler<"GetCurrentUserCommand"> {
  public override readonly commandName = "GetCurrentUserCommand";

  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "public",
    "user",
    "admin",
  ];

  public constructor(
    @inject(userRepoToken)
    private users: IRepository<IUser>,
  ) {
    super();
  }

  public override async handle({
    session,
  }: IHandleContext<"GetCurrentUserCommand">): Promise<IUser | undefined> {
    const sessionData = await session.get();

    if (sessionData?.userId) {
      const user = await this.users.get(sessionData.userId);

      if (
        user &&
        JSON.stringify(user.permissions) !==
          JSON.stringify(sessionData.permissions)
      ) {
        session.set({
          ...sessionData,
          permissions: user.permissions,
        });
      }

      if (!user) {
        throw new AppError(
          `Logged in user wasn't found in the database. Have they been deleted?`,
        );
      }
      return user;
    }

    return undefined;
  }
}
