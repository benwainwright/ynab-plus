import { AppError } from "@errors";
import {
  CurrentUserSetterToken,
  UserRepositoryToken,
  type ICurrentUserSetter,
  type IHandleContext,
  type IRepository,
} from "@ports";
import { LoggerToken, type ILogger } from "@ynab-plus/bootstrap";
import { User, type IRole } from "@ynab-plus/domain";

import { AbstractApplicationService } from "@core";
import { inject, injectable } from "inversify";

@injectable()
export class GetCurrentUserService extends AbstractApplicationService<"GetCurrentUserCommand"> {
  public override readonly commandName = "GetCurrentUserCommand";

  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "public",
    "user",
    "admin",
  ];

  public constructor(
    @inject(UserRepositoryToken)
    private users: IRepository<User>,

    @inject(CurrentUserSetterToken)
    private currentUserSetter: ICurrentUserSetter,

    @inject(LoggerToken)
    logger: ILogger,
  ) {
    super(logger);
  }

  public override async handle<TRole extends IRole>({
    command,
  }: IHandleContext<"GetCurrentUserCommand", TRole>): Promise<
    User | undefined
  > {
    const { role } = command;

    if (!role) {
      return undefined;
    }

    if (!(role instanceof User)) {
      throw new AppError(
        `Command cannot be executed without a user based context`,
      );
    }

    const user = await this.users.get(role.id);

    if (
      user &&
      JSON.stringify(user.permissions) !== JSON.stringify(role.permissions)
    ) {
      role.update({ permissions: user.permissions });

      await this.currentUserSetter.set(role);
    }

    if (!user) {
      throw new AppError(
        `Logged in user wasn't found in the database. Have they been deleted?`,
      );
    }
    return user;
  }
}
