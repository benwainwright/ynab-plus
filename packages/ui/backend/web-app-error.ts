import StackTracey from "stacktracey";
import type { IEventBus } from "@ynab-plus/app";

export class WebAppError extends Error {
  public handle(events: IEventBus) {
    const stack = new StackTracey(this);

    const parsedStack = stack.items.map((item) => ({
      calee: item.callee,
      file: `${item.fileRelative}:${item.line}:${item.column}`,
    }));

    events.emit("ApplicationError", {
      stack: parsedStack,
      message: this.message,
    });
  }
}
