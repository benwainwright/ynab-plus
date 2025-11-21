import type { AllEvents, IEventPacket } from "@ynab-plus/app";

import { useEvents } from "./use-events.ts";

export const useEvent = <TKey extends keyof AllEvents>(
  key: TKey,
  callback: (data: IEventPacket<TKey>["data"]) => Promise<void> | void,
) => {
  useEvents((event) => {
    if (event.key === key) {
      void callback(event.data);
    }
  });
};
