export interface ITransaction {
  id: string;
  date: Date;
  amount: 0;
  cleared: boolean;
  memo: string;
  approved: boolean;
}
