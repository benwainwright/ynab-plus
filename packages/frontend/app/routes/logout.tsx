import { command } from "@data";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export const Logout = () => {
  const navigate = useNavigate();
  useEffect(() => {
    void (async () => {
      await command("Logout", undefined);
      await navigate("/login");
    })();
  });

  return (
    <>
      <p>Logging out...</p>
    </>
  );
};

export default Logout;
