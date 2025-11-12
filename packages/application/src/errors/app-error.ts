import StackTracey from "stacktracey";
import type { IEventBus } from "../ports/index.ts";

export class AppError extends Error {
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
