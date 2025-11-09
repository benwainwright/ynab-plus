import type { IUser } from "@types";

export const canAccess = ({
  user,
  routeTags,
}: {
  user: IUser | undefined;
  routeTags: string[];
}) => {
  if (!user && routeTags.includes("public")) {
    return true;
  }

  return Boolean(user?.permissions.find((item) => routeTags.includes(item)));
};
