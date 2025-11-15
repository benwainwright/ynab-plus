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
            <th>Created</th>
            <th>Refreshed</th>
            <th>Expiry</th>
          </tr>
        </thead>
        <tbody>
          <IntegrationStatus provider="ynab" />
        </tbody>
      </table>
    </ProtectedRoute>
  );
};

export default Integrations;
