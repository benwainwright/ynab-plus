import { SocketContext, useCommand, useEvents } from "@client/hooks";
import { useContext } from "react";
import { Link, useNavigate } from "react-router";

export const Login = () => {
  const { socket } = useContext(SocketContext);
  const { send } = useCommand("LoginCommand", socket);

  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    await send({
      username: data.get("username")?.toString() ?? "",
      password: data.get("password")?.toString() ?? "",
    });
  };

  useEvents(socket, (events) => {
    if (events.key === "LoginSuccess") {
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
