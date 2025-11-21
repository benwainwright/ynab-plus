import type { IEventBus } from "@ports";
import { DomainModel } from "@ynab-plus/domain";

export const emitDomainEventsOnSave = <T extends object>(
  thing: T,
  bus: IEventBus,
  ...keys: (keyof T)[]
): T => {
  return keys.reduce<T>(
    (last, key) => emitDomainEventsOnSaveHelper(last, key, bus),
    thing,
  );
};

export const emitDomainEventsOnSaveHelper = <T extends object>(
  thing: T,
  key: keyof T,
  bus: IEventBus,
): T => {
  const handler: ProxyHandler<T> = {
    get: (target, prop) => {
      if (key in target && prop === key) {
        const theFunction = target[key];
        if (typeof theFunction === "function") {
          return new Proxy(theFunction, {
            apply(target, thisArg, argumentsList: unknown[]) {
              const result = target.apply(thisArg, argumentsList) as unknown;
              argumentsList.forEach((item) => {
                if (item instanceof DomainModel) {
                  const events = item.pullEvents();
                  events.forEach((event) => {
                    bus.emit(event.event, event.data);
                  });
                }
              });
              return result;
            },
          });
        }
      }

      return target[prop as keyof T];
    },
  };

  return new Proxy(thing, handler);
};
