export interface ILogger {
  log(level: "info" | "debug", message: string): void;
}
