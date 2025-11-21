export type IEvent<TObject, TKey extends keyof TObject> = {
  event: TKey;
  data: TObject[TKey];
};
