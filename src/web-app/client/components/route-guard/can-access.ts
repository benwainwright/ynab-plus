import type { User } from "@domain";

export const canAccess = ({
  user,
  routeTags,
}: {
  user: User | undefined;
  routeTags: string[];
}) => {
  if (!user && routeTags.includes("public")) {
    return true;
  }

  return Boolean(user?.permissions.find((item) => routeTags.includes(item)));
};
