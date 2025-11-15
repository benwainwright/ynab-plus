import { ProtectedRoute } from "@components";
import { useTransactions } from "@data";

export const Transactions = () => {
  useTransactions();
  return (
    <ProtectedRoute routeName="transactions">
      <h2>Transactions</h2>
    </ProtectedRoute>
  );
};

export default Transactions;
