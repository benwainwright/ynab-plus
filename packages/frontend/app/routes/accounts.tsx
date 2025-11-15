import { Loader, ProtectedRoute } from "@components";
import { useAccounts } from "@data";

export const Transactions = () => {
  const { isPending, accounts } = useAccounts();
  return (
    <ProtectedRoute routeName="accounts">
      <h2>Accounts</h2>
      <Loader isPending={isPending} data={accounts}>
        {(data) => (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {data.map((account) => (
                <tr key={`${account.id}-account-row`}>
                  <td>{account.name}</td>
                  <td>{account.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Loader>
    </ProtectedRoute>
  );
};

export default Transactions;
