import { showNotification } from "./show-notification.tsx";
import { useEvents } from "./use-events.ts";

export const useNotifications = () => {
  useEvents((event) => {
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

      case "OauthIntegrationDisconnected":
        showNotification({
          type: "info",
          message: "Integration Disconnected",
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
          message: `Could not execute handler ${event.data.handler}. User '${String(event.data.role?.id)}' permissions: ${String(event.data.role?.permissions.join(", "))}, required: ${event.data.requiredPermissions.join(", ")}`,
        });
        break;
    }
  });
};
