import { IntegrationStatus, ProtectedRoute } from "@components";

export const Integrations = () => {
  return (
    <ProtectedRoute routeName="integrations">
      <h2>Integrations</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>YNAB</td>
            <td>
              <IntegrationStatus provider="ynab" />
            </td>
          </tr>
        </tbody>
      </table>
    </ProtectedRoute>
  );
};

export default Integrations;
