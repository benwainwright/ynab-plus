export interface IStartable {
  readonly name: string;
  start(): Promise<void>;
}
