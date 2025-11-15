import { ProtectedRoute } from "@components";
import { useAccounts } from "@data";

export const Transactions = () => {
  const { isPending, accounts } = useAccounts();
  return (
    <ProtectedRoute routeName="accounts">
      <h2>Accounts</h2>
      {isPending ? (
        <div aria-busy></div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr>
                <td>{account.name}</td>
                <td>{account.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </ProtectedRoute>
  );
};

export default Transactions;
