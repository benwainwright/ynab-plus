import { AbstractApplicationService } from "./abstract-application-service.ts";
import type { User } from "@ynab-plus/domain";
import { AppError } from "@errors";
import type { IHandleContext, IRepository } from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";

export class GetCurrentUserService extends AbstractApplicationService<"GetCurrentUserCommand"> {
  public override readonly commandName = "GetCurrentUserCommand";

  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "public",
    "user",
    "admin",
  ];

  public constructor(
    private users: IRepository<User>,
    logger: ILogger,
  ) {
    super(logger);
  }

  public override async handle({
    currentUserCache,
  }: IHandleContext<"GetCurrentUserCommand">): Promise<User | undefined> {
    const sessionData = await currentUserCache.get();

    if (sessionData?.id) {
      const user = await this.users.get(sessionData.id);

      if (
        user &&
        JSON.stringify(user.permissions) !==
          JSON.stringify(sessionData.permissions)
      ) {
        currentUserCache.set({
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
