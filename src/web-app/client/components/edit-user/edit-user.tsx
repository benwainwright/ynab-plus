import { type Permission } from "@domain";
import { getUser } from "../../hooks";
import { use, useState, type ChangeEvent } from "react";
import { useParams } from "react-router";

export const EditUser = () => {
  const { userId } = useParams();
  const user = use(getUser(userId));
  const [email, setEmail] = useState(user?.email);
  const [permissions, setPermissions] = useState(user?.permissions ?? []);

  if (!user) {
    return <p>User was not found!</p>;
  }

  const permissionChange = (
    permission: Permission,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.checked) {
      setPermissions([...permissions, permission]);
    } else {
      setPermissions(
        permissions.filter(
          (existingPermission) => permission === existingPermission,
        ),
      );
    }
  };

  return (
    <>
      <h2>Edit User</h2>

      <form>
        <fieldset>
          <label>
            Username
            <input
              name="username"
              placeholder="Username"
              value={user.id}
              disabled
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
                  onChange={(event) => permissionChange(permission, event)}
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
