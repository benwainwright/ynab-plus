import { IconX, IconCheck } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

export interface INotification {
  type: "error" | "info" | "success";
  message: string;
}

const getProps = (notification: INotification) => {
  const xIcon = <IconX size={20} />;
  const checkIcon = <IconCheck size={20} />;
  switch (notification.type) {
    case "error":
      return {
        color: "red",
        title: "Error!",
        icon: xIcon
      };

    case "success":
      return {
        color: "green",
        title: "Success",
        icon: checkIcon
      };

    default:
      return { color: "blue", title: "Info" };
  }
};

export const showNotification = (notification: INotification) => {
  notifications.show({
    position: "top-left",
    message: notification.message,
    autoClose: 5_000,
    ...getProps(notification)
  });
};
