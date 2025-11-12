import { useNavigate } from "react-router";
import { command, useEvents } from "@data";

export const Register = () => {
  const navigate = useNavigate();

  useEvents((event) => {
    if (event.key === "RegisterSuccess") {
      navigate("/");
    }
  });

  const onSubmit = async (data: FormData) => {
    await command("RegisterCommand", {
      username: data.get("username")?.toString() ?? "",
      email: data.get("email")?.toString() ?? "",
      password: data.get("password")?.toString() ?? "",
    });
  };

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
