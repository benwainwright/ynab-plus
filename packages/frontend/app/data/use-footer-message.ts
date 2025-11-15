import { useState } from "react";

import { useEvents } from "./use-events.ts";

interface FooterMessage {
  type: "error" | "info";
  message: string;
}

export const useFooterMessage = () => {
  const [message, setMessage] = useState<FooterMessage | undefined>();
  useEvents((event) => {
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

      case "UserUpdated":
        setMessage({
          type: "info",
          message: "User was updated",
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
          message: `Could not execute handler ${event.data.handler}. User '${String(event.data.userId)}' permissions: ${event.data.userPermissions.join(", ")}, required: ${event.data.requiredPermissions.join(", ")}`,
        });
        break;
    }
  });

  return message;
};
