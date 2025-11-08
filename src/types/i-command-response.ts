export interface ICommandResponse<TKey extends keyof Commands> {
  key: TKey;
  id: string;
  data: Commands[TKey]["response"];
}
