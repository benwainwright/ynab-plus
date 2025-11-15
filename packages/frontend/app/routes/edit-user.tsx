import { Loader, NewPasswordInput, ProtectedRoute } from "@components";
import { useUser } from "@data";
import { useParams } from "react-router";
export const EditUser = () => {
  const { userId } = useParams<{ userId: string }>();
  const { isPending, user, setUser } = useUser(userId);

  return (
    <ProtectedRoute routeName="editUser">
      <h2>Edit User</h2>
      <Loader isPending={isPending} data={user}>
        {(user) => (
          <form>
            <fieldset>
              <label>
                Username
                <input
                  name="username"
                  placeholder="Username"
                  value={user.username}
                  onChange={(event) => {
                    setUser({ ...user, username: event.target.value });
                  }}
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  placeholder="Email"
                  value={user.username}
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
            </fieldset>

            <input type="submit" value="Subscribe" />
          </form>
        )}
      </Loader>
    </ProtectedRoute>
  );
};

export default EditUser;
