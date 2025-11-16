import { CurrentUserContext, Page } from "@components";
import { command, useEvent } from "@data";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";

export const Logout = () => {
  const navigate = useNavigate();
  const { currentUser, reloadUser } = useContext(CurrentUserContext);

  useEffect(() => {
    void (async () => {
      if (currentUser) {
        await command("LogoutCommand", undefined);
      } else {
        await navigate("/login");
      }
    })();
  }, [currentUser]);

  useEvent("LogoutSuccess", () => {
    reloadUser();
  });

  return (
    <Page routeName="logout">
      <p>Logging out...</p>
    </Page>
  );
};

export default Logout;
