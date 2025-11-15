import { Loader, NewPasswordInput, ProtectedRoute } from "@components";
import { useUser } from "@data";
import { permissions } from "@ynab-plus/domain";
import type { FormEvent } from "react";
import { Fragment } from "react/jsx-runtime";
import { useParams } from "react-router";
export const EditUser = () => {
  const { userId } = useParams<{ userId: string }>();
  const { isPending, user, setUser, saveUser } = useUser(userId);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await saveUser();
  };

  return (
    <ProtectedRoute routeName="editUser">
      <h2>Edit User</h2>
      <Loader isPending={isPending} data={user}>
        {(user) => (
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          <form onSubmit={onSubmit}>
            <fieldset>
              <label>
                Username
                <input
                  disabled
                  name="username"
                  placeholder="Username"
                  value={user.username}
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  placeholder="Email"
                  value={user.email}
                  onChange={(event) => {
                    setUser({ ...user, email: event.target.value });
                  }}
                />
              </label>
              <NewPasswordInput
                onChange={(password) => {
                  setUser({ ...user, password });
                }}
              />

              <fieldset>
                <legend>Permissions</legend>
                {permissions.map((permission) => (
                  <Fragment key={`permission-check-${permission}`}>
                    <label>
                      <input
                        type="checkbox"
                        name={permission}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          if (
                            !user.permissions.includes(permission) &&
                            checked
                          ) {
                            setUser({
                              ...user,
                              permissions: [...user.permissions, permission],
                            });
                          } else if (
                            user.permissions.includes(permission) &&
                            !checked
                          ) {
                            setUser({
                              ...user,
                              permissions: user.permissions.filter(
                                (thePermission) => permission !== thePermission,
                              ),
                            });
                          }
                        }}
                        checked={user.permissions.includes(permission)}
                      />
                      {permission}
                    </label>
                  </Fragment>
                ))}
              </fieldset>
            </fieldset>

            <input type="submit" value="Subscribe" />
          </form>
        )}
      </Loader>
    </ProtectedRoute>
  );
};

export default EditUser;
