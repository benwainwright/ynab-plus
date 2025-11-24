import type { IHandleContext, IRepository } from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { IRole, Permission, User } from "@ynab-plus/domain";

import { AbstractApplicationService } from "@core";

export class GetUsersService extends AbstractApplicationService<"GetUsersCommand"> {
  public override readonly commandName = "GetUsersCommand";

  public override requiredPermissions: Permission[] = [
    "admin",
    "public",
    "user",
    "system",
  ];

  public constructor(
    private users: IRepository<User>,
    logger: ILogger,
  ) {
    super(logger);
  }

  protected override async handle<TRole extends IRole>({
    command,
  }: IHandleContext<"GetUsersCommand", TRole>): Promise<(User | undefined)[]> {
    const { usernames } = command.data;

    return Promise.all(
      usernames.map(async (username) => {
        return await this.users.get(username);
      }),
    );
  }
}
