import { ApplicationService } from "../application-service.ts";
import type { User } from "@domain";
import type { IHandleContext, IRepository } from "../ports/index.ts";

export class GetUserService extends ApplicationService<"GetUser"> {
  public override readonly commandName = "GetUser";

  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "admin",
    "public",
    "user",
  ];

  public constructor(private users: IRepository<User>) {
    super();
  }

  public override async handle({
    command,
  }: IHandleContext<"GetUser">): Promise<User | undefined> {
    const { username } = command.data;

    return this.users.get(username);
  }
}
