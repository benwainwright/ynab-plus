import { type IHandleContext, type IMultipleRepository, type IRepository } from "@ports";
import { type ILogger } from "@ynab-plus/bootstrap";
import type { IRole, User } from "@ynab-plus/domain";

import { inject, AbstractApplicationService } from "@core";

export class ListUsersService extends AbstractApplicationService<"ListUsersCommand"> {
  public override requiredPermissions: ("public" | "user" | "admin")[] = ["admin"];

  public constructor(
    @inject("UserRepository")
    private users: IMultipleRepository<User> & IRepository<User>,

    @inject("Logger")
    logger: ILogger
  ) {
    super(logger);
  }

  public override readonly commandName = "ListUsersCommand";

  public override async handle<TRole extends IRole>({
    command
  }: IHandleContext<"ListUsersCommand", TRole>): Promise<User[]> {
    const { offset, limit } = command.data;

    return await this.users.getMany(offset, limit);
  }
}
