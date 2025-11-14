import { CurrentUserContext,ProtectedRoute } from "@components";
import { command, useEvents } from "@data";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";

export const Logout = () => {
  const navigate = useNavigate();
  const { currentUser, reloadUser } = useContext(CurrentUserContext);

  useEffect(() => {
    void (async () => {
      if (currentUser) {
        await command("Logout", undefined);
      } else {
        await navigate("/login");
      }
    })();
  }, [currentUser]);

  useEvents((event) => {
    if (event.key === "LogoutSuccess") {
      reloadUser();
    }
  });

  return (
    <ProtectedRoute routeName="logout">
      <p>Logging out...</p>
    </ProtectedRoute>
  );
};

export default Logout;
