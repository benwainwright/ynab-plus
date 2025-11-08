import { CommandHandler } from "@core";
import type {
  ICommandMessage,
  IEventBus,
  IHandleContext,
  IRepository,
  ISessionData,
  IUser,
} from "@types";
import type { SessionStorage } from "../core/session-storage.ts";

export class GetCurrentUserCommandHandler extends CommandHandler<"GetCurrentUser"> {
  public override readonly commandName = "GetCurrentUser";

  public constructor(private users: IRepository<IUser>) {
    super();
  }

  public override async handle({
    session,
  }: IHandleContext<"GetCurrentUser">): Promise<IUser | undefined> {
    const id = await session.get();

    return id?.userId ? this.users.get(id.userId) : undefined;
  }
}
