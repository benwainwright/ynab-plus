import { CommandClient, getOpenSocket, useEvents } from "@hooks";
import { useNavigate } from "react-router";
import { use } from "react";

export const Register = () => {
  const socket = use(getOpenSocket());
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    const client = new CommandClient(socket);
    await client.send("RegisterCommand", {
      username: data.get("username")?.toString() ?? "",
      email: data.get("email")?.toString() ?? "",
      password: data.get("password")?.toString() ?? "",
    });
  };

  useEvents(socket, (events) => {
    if (events.key === "RegisterSuccess") {
      navigate("/");
    }
  });

  return (
    <form action={onSubmit}>
      <h2>Register</h2>
      <input name="username" type="text" placeholder="Username" />
      <input name="email" type="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
      <input name="verify" type="password" placeholder="Verify Password" />
      <input type="submit" value="Log in" />
    </form>
  );
};
