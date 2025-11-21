import StackTracey from "stacktracey";

interface StackLine {
  callee: string;
  file: string;
}

interface IEventEmitter {
  emit(key: unknown, data: unknown): void;
}

export abstract class AbstractError extends Error {
  public parsedStack: StackLine[];

  public constructor(message: string) {
    super(message);
    const stack = new StackTracey(this);

    this.parsedStack = stack.items.map((item) => {
      const lineString = item.line ? `:${String(item.line)}` : ``;
      const colString = item.column ? `:${String(item.column)}` : ``;

      return {
        callee: item.callee,
        file: `${item.fileRelative}:${lineString}${colString}`,
      };
    });
  }

  public abstract handle(events: IEventEmitter): void;
}
