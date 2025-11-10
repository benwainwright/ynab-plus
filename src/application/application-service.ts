import { NotAuthorisedError } from "@errors";
import type { ISingleItemStore } from "./ports/i-single-item-store.ts";
import type { Permission, User } from "@domain";
import type { ICommandMessage, IHandleContext } from "./ports/index.ts";

export abstract class ApplicationService<TKey extends keyof Commands> {
  public constructor() {}

  public abstract readonly commandName: TKey;
  public abstract readonly requiredPermissions: Permission[];

  public canHandle(
    command: ICommandMessage<keyof Commands>,
  ): command is ICommandMessage<TKey> {
    return command.key === this.commandName;
  }

  private async currentUserPermissions(
    session: ISingleItemStore<User | undefined>,
  ): Promise<Permission[]> {
    const data = await session.get();

    if (!data || !data.permissions) {
      return ["public"];
    }

    return data.permissions;
  }

  public async doHandle(
    context: IHandleContext<TKey>,
  ): Promise<Commands[TKey]["response"]> {
    const { currentUserCache } = context;
    const permissions = await this.currentUserPermissions(currentUserCache);

    const hasValidPermission = Boolean(
      permissions.find((permission) =>
        this.requiredPermissions.includes(permission),
      ),
    );

    if (!hasValidPermission) {
      const data = await currentUserCache.get();
      throw new NotAuthorisedError(
        `Not authorised to execute ${this.commandName}`,
        this.commandName,
        data?.id,
        permissions,
        this.requiredPermissions,
      );
    }

    return await this.handle(context);
  }

  protected abstract handle(
    context: IHandleContext<TKey>,
  ): Promise<Commands[TKey]["response"]>;
}
