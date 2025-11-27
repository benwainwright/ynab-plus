import { UserNotFoundError } from "@errors";
import {
  type IHandleContext,
  type IMultipleRepository,
  type IRepository,
} from "@ports";
import { type ILogger } from "@ynab-plus/bootstrap";
import type { IRole, Permission, User } from "@ynab-plus/domain";

import { inject, AbstractApplicationService } from "@core";
import { injectable } from "inversify";

@injectable()
export class GetUserService extends AbstractApplicationService<"GetUserCommand"> {
  public override readonly commandName = "GetUserCommand";

  public override requiredPermissions: Permission[] = [
    "admin",
    "public",
    "user",
    "system",
  ];

  public constructor(
    @inject("UserRepository")
    private users: IRepository<User> & IMultipleRepository<User>,

    @inject("Logger")
    logger: ILogger,
  ) {
    super(logger);
  }

  protected override async handle<TRole extends IRole>({
    command,
  }: IHandleContext<"GetUserCommand", TRole>): Promise<User | undefined> {
    const { username } = command.data;

    const user = await this.users.get(username);

    if (!user) {
      throw new UserNotFoundError(
        `Could not find user '${username}'`,
        username,
      );
    }

    return user;
  }
}
