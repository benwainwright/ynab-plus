import { Page } from "@components";
import { Typography } from "@mantine/core";

const Home = () => {
  return (
    <Page routeName="home">
      <Typography>
        <p>You are now logged in</p>
      </Typography>
    </Page>
  );
};

export default Home;
