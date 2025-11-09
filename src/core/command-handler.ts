import { NotAuthorisedError } from "@errors";
import type {
  IHandleContext,
  ICommandMessage,
  Permission,
  IStore,
  ISessionData,
} from "@types";

export abstract class CommandHandler<TKey extends keyof Commands> {
  public constructor() {}

  public abstract readonly commandName: TKey;
  public abstract readonly requiredPermissions: Permission[];

  public canHandle(
    command: ICommandMessage<keyof Commands>,
  ): command is ICommandMessage<TKey> {
    return command.key === this.commandName;
  }

  private async currentUserPermissions(
    session: IStore<ISessionData>,
  ): Promise<Permission[]> {
    const data = await session.get();

    if (!data || !data.permissions) {
      return ["public"];
    }

    return data.permissions;
  }

  public async doHandle(context: IHandleContext<TKey>) {
    const { session, command, eventBus } = context;
    const permissions = await this.currentUserPermissions(session);

    const hasValidPermission = Boolean(
      permissions.find((permission) =>
        this.requiredPermissions.includes(permission),
      ),
    );

    if (!hasValidPermission) {
      const data = await session.get();
      throw new NotAuthorisedError(
        `Not authorised to execute ${this.commandName}`,
        this.commandName,
        data?.userId,
        permissions,
        this.requiredPermissions,
      );
    }

    const response = await this.handle(context);

    eventBus.emit("CommandResponse", {
      key: this.commandName,
      data: response,
      id: command.id,
    });
  }

  protected abstract handle(
    context: IHandleContext<TKey>,
  ): Promise<Commands[TKey]["response"]>;
}
