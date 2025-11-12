import { command } from "@data";
import { Link } from "react-router";

export const Login = () => {
  const onSubmit = async (data: FormData) => {
    await command("LoginCommand", {
      username: data.get("username")?.toString() ?? "",
      password: data.get("password")?.toString() ?? "",
    });
  };
  return (
    <form action={onSubmit}>
      <h2>Login</h2>
      <input name="username" type="text" placeholder="Username" />
      <input name="password" type="password" placeholder="Password" />
      <input type="submit" value="Log in" />
      <p>
        Or you can <Link to="/register">register</Link> an account
      </p>
    </form>
  );
};

export default Login;
