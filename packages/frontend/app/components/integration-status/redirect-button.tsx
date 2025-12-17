import type { Oauth2IntegrationStatusLoading, Oauth2IntegrationStatusNeedsRedirect } from "@data";
import { Button, Flex } from "@mantine/core";
import type { ReactNode } from "react";

interface RedirectButtonProps {
  status: Oauth2IntegrationStatusNeedsRedirect | Oauth2IntegrationStatusLoading;
}

export const RedirectButton = ({ status }: RedirectButtonProps): ReactNode => {
  return (
    <Flex justify={"center"}>
      <Button component="a" href={status.status === "not_connected" ? status.redirectUrl : "#"}>
        Connect
      </Button>
    </Flex>
  );
};
