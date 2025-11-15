export interface IAccount {
  id: string;
  userId: string;
  name: string;
  type: string;
  closed: boolean;
  note: string | undefined;
  deleted: boolean;
}
