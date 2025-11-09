import { SocketContext, useCommand } from "@client/hooks";
import { useContext, useEffect } from "react";

export const Logout = () => {
  const { socket } = useContext(SocketContext);
  const { send } = useCommand("Logout", socket);

  useEffect(() => {
    (async () => {
      await send(undefined);
      window.location.href = "/";
    })();
  });

  return (
    <>
      <p>Logging out...</p>
    </>
  );
};
