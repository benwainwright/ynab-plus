import { CurrentUserContext, ProtectedRoute } from "@components";
import { command, useEvents } from "@data";
import { getFormDataStringValue } from "@utils";
import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router";

export const Login = () => {
  const { currentUser, reloadUser } = useContext(CurrentUserContext);
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      if (currentUser) {
        await navigate("/");
      }
    })();
  }, [currentUser]);

  useEvents((event) => {
    if (event.key === "LoginSuccess") {
      reloadUser();
    }
  });

  const onSubmit = async (data: FormData) => {
    await command("LoginCommand", {
      username: getFormDataStringValue(data, "username"),
      password: getFormDataStringValue(data, "password"),
    });
  };
  return (
    <ProtectedRoute routeName="login">
      <form action={onSubmit}>
        <h2>Login</h2>
        <input name="username" type="text" placeholder="Username" />
        <input name="password" type="password" placeholder="Password" />
        <input type="submit" value="Log in" />
        <p>
          Or you can <Link to="/register">register</Link> an account
        </p>
      </form>
    </ProtectedRoute>
  );
};

export default Login;
