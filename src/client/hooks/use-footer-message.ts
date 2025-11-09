import { use, useState } from "react";
import { useEvents } from "./use-events.ts";
import { getOpenSocket } from "./get-open-socket.ts";

interface FooterMessage {
  type: "error" | "info";
  message: string;
}

export const useFooterMessage = () => {
  const [message, setMessage] = useState<FooterMessage | undefined>();
  const socket = use(getOpenSocket());
  useEvents(socket, (event) => {
    switch (event.key) {
      case "ApplicationError":
        setMessage({
          type: "error",
          message: event.data.message,
        });
        break;

      case "LoginSuccess":
        setMessage({
          type: "info",
          message: "Login Successful",
        });
        break;

      case "LoginFail":
        setMessage({
          type: "error",
          message: "Login Failed",
        });
        break;

      case "LogoutSuccess":
        setMessage({
          type: "info",
          message: "Logout Successful",
        });
        break;

      case "RegisterSuccess":
        setMessage({
          type: "info",
          message: "Registration Successful",
        });
        break;

      case "NotAuthorisedError":
        setMessage({
          type: "error",
          message: `Could not execute handler ${event.data.handler}. User '${event.data.userId}' permissions: ${event.data.userPermissions.join(", ")}, required: ${event.data.requiredPermissions.join(", ")}`,
        });
        break;
    }
  });

  return message;
};
