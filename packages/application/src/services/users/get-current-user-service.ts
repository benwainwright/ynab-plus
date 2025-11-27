import { AppError } from "@errors";
import {
  type ICurrentUserSetter,
  type IHandleContext,
  type IMultipleRepository,
  type IRepository,
} from "@ports";
import { type ILogger } from "@ynab-plus/bootstrap";
import { User, type IRole } from "@ynab-plus/domain";

import { inject, AbstractApplicationService } from "@core";
import { injectable, optional } from "inversify";

@injectable()
export class GetCurrentUserService extends AbstractApplicationService<"GetCurrentUserCommand"> {
  public override readonly commandName = "GetCurrentUserCommand";

  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "public",
    "user",
    "admin",
  ];

  public constructor(
    @inject("UserRepository")
    private users: IRepository<User> & IMultipleRepository<User>,

    @inject("Logger")
    logger: ILogger,

    @optional()
    @inject("CurrentUserSetter")
    private currentUserSetter?: ICurrentUserSetter,
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

      await this.currentUserSetter?.set(role);
    }

    if (!user) {
      throw new AppError(
        `Logged in user wasn't found in the database. Have they been deleted?`,
      );
    }
    return user;
  }
}
