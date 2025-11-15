import type { IEventPacket } from "@ynab-plus/app";
import type { Events } from "@ynab-plus/domain";

import { useEvents } from "./use-events.ts";

export const useEvent = <TKey extends keyof Events>(
  key: TKey,
  callback: (data: IEventPacket<TKey>["data"]) => Promise<void> | void,
) => {
  useEvents((event) => {
    if (event.key === key) {
      void callback(event.data);
    }
  });
};
