export interface IObjectStorage<TObject extends object> {
  get(key: string): Promise<TObject | undefined>;
  set(key: string, thing: TObject | undefined): Promise<void>;
}
