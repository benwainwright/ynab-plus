import { AbstractApplicationService } from "./abstract-application-service.ts";
import type { User } from "@ynab-plus/domain";
import type { IHandleContext, IRepository } from "@ports";

export class ListUsersService extends AbstractApplicationService<"ListUsersCommand"> {
  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "user",
  ];

  public constructor(private users: IRepository<User>) {
    super();
  }

  public override readonly commandName = "ListUsersCommand";

  public override async handle({
    command,
  }: IHandleContext<"ListUsersCommand">): Promise<User[]> {
    const { offset, limit } = command.data;

    return await this.users.getMany(offset, limit);
  }
}
