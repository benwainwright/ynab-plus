export interface ISerialiser<T extends object> {
  serialise(thing: T): string;
  deSerialise(content: string): T;
}
