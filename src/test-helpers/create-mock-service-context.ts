import { mock as bunMock } from "bun:test";
import { mock } from "bun-mock-extended";

import type { ICommandMessage, IEventBus } from "@application";
import type { ISingleItemStore } from "@application/ports";
import type { User } from "@domain";

export const createMockServiceContext = <TCommandKey extends keyof Commands>(
  key: TCommandKey,
  data: ICommandMessage<TCommandKey>["data"],
  currentUser?: User,
) => {
  const command: ICommandMessage<TCommandKey> = {
    key,
    id: "foo",
    data,
  };

  const eventBus = mock<IEventBus>();

  const currentUserCache = mock<ISingleItemStore<User>>({
    get: bunMock().mockResolvedValue(currentUser),
  });

  return { command, eventBus, currentUserCache };
};
