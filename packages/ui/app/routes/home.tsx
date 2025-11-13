import { needsPermissions } from "@middleware";

export const clientMidleware = [needsPermissions(["admin", "user"])];

const Home = () => {
  return (
    <>
      <h2>Dashboard</h2>
      <p>You are now logged in</p>
    </>
  );
};

export default Home;
