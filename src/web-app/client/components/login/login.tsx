import { CommandClient, getOpenSocket, useEvents } from "../../hooks/index.ts";
import { Link, useNavigate } from "react-router";
import { delay } from "./delay.ts";
import { use } from "react";

export const Login = () => {
  const socket = use(getOpenSocket());

  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    const client = new CommandClient(socket);

    await client.send("LoginCommand", {
      username: data.get("username")?.toString() ?? "",
      password: data.get("password")?.toString() ?? "",
    });
  };

  useEvents(socket, async (events) => {
    if (events.key === "LoginSuccess") {
      await delay(2);
      navigate("/");
    }
  });

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
