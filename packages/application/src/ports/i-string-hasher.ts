export interface IStringHasher {
  hash(text: string): Promise<string>;
}
