import { Page } from "@components";
import { Typography } from "@mantine/core";

const Home = () => {
  return (
    <Page routeName="home">
      <Typography>
        <p>
          Welcome to YNAB plus - to get started, head over to the integrations
          page
        </p>
      </Typography>
    </Page>
  );
};

export default Home;
