import { showNotification } from "./show-notification.tsx";
import { useEvents } from "./use-events.ts";

export const useNotifications = () => {
  useEvents((event) => {
    console.log(event);
    switch (event.key) {
      case "ApplicationError":
        showNotification({
          type: "error",
          message: event.data.message,
        });
        break;

      case "LoginSuccess":
        showNotification({
          type: "success",
          message: "Login Successful",
        });
        break;

      case "LoginFail":
        showNotification({
          type: "error",
          message: "Login Failed",
        });
        break;

      case "LogoutSuccess":
        showNotification({
          type: "success",
          message: "Logout Successful",
        });
        break;

      case "UserUpdated":
        showNotification({
          type: "success",
          message: "User was updated",
        });
        break;

      case "RegisterSuccess":
        showNotification({
          type: "success",
          message: "Registration Successful",
        });
        break;

      case "NotAuthorisedError":
        showNotification({
          type: "error",
          message: `Could not execute handler ${event.data.handler}. User '${String(event.data.userId)}' permissions: ${event.data.userPermissions.join(", ")}, required: ${event.data.requiredPermissions.join(", ")}`,
        });
        break;
    }
  });
};
