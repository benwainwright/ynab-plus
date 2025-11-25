import { UserNotFoundError } from "@errors";
import {
  CurrentUserSetterToken,
  type IHandleContext,
  type IRepository,
} from "@ports";
import { LoggerToken, type ILogger } from "@ynab-plus/bootstrap";
import type { IRole, Permission, User } from "@ynab-plus/domain";

import { AbstractApplicationService } from "@core";
import { inject, injectable } from "inversify";

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
    @inject(CurrentUserSetterToken)
    private users: IRepository<User>,

    @inject(LoggerToken)
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
