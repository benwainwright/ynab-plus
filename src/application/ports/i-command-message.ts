export interface ICommandMessage<TKey extends keyof Commands> {
  key: TKey;
  id: string;
  data: Commands[TKey]["request"];
}
