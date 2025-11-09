import type { IUser } from "@types";

export const canAccess = ({
  user,
  routeTags,
  finishedLoading,
}: {
  finishedLoading: boolean;
  user: IUser | undefined;
  routeTags: string[];
}) => {
  if (finishedLoading) {
    if (!user && routeTags.includes("public")) {
      return true;
    }

    return Boolean(user?.permissions.find((item) => routeTags.includes(item)));
  }

  return true;
};
