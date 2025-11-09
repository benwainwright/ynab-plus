import { getUser } from "@client/hooks";
import { permissions } from "@types";
import { use } from "react";
import { useParams } from "react-router";

export const EditUser = () => {
  const { userId } = useParams();

  if (!userId) {
    return <p>User ID expected!</p>;
  }

  const user = use(getUser(userId));

  if (!user) {
    return <p>User was not found!</p>;
  }

  return (
    <>
      <h2>Edit User</h2>

      <form>
        <fieldset>
          <label>
            Username
            <input name="username" placeholder="Username" value={user.id} />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              value={user.email}
            />
          </label>
          <fieldset>
            <legend>Permissions</legend>
            {permissions.map((permission) => (
              <label>
                <input
                  type="checkbox"
                  name="permission"
                  checked={user.permissions.includes(permission)}
                />
                {permission}
              </label>
            ))}
          </fieldset>
        </fieldset>
      </form>
    </>
  );
};
