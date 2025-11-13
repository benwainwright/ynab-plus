import { command } from "@data";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export const Logout = () => {
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      await command("Logout", undefined);
      navigate("/login");
    })();
  });

  return (
    <>
      <p>Logging out...</p>
    </>
  );
};

export default Logout;
