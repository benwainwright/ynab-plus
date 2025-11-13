import { Form, useNavigate } from "react-router";
import { command, useEvents } from "@data";
import type { Route } from "./+types/register.ts";
import { needsPermissions } from "@middleware";

export async function clientAction({ request }: Route.ClientActionArgs) {
  const data = await request.formData();
  await command("RegisterCommand", {
    username: data.get("username")?.toString() ?? "",
    email: data.get("email")?.toString() ?? "",
    password: data.get("password")?.toString() ?? "",
  });
}

export const Register = () => {
  const navigate = useNavigate();

  useEvents((event) => {
    if (event.key === "RegisterSuccess") {
      navigate("/");
    }
  });

  return (
    <Form method="post">
      <h2>Register</h2>
      <input name="username" type="text" placeholder="Username" />
      <input name="email" type="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
      <input name="verify" type="password" placeholder="Verify Password" />
      <input type="submit" value="Submit" />
    </Form>
  );
};

export default Register;
