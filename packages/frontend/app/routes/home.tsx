import { ProtectedRoute } from "@components";

const Home = () => {
  return (
    <ProtectedRoute routeName="home">
      <h2>Dashboard</h2>
      <p>You are now logged in</p>
    </ProtectedRoute>
  );
};

export default Home;
