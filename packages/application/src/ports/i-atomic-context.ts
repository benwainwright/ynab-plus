export interface IAtomicContext {
  execute(callback: () => Promise<void>): void;
}
