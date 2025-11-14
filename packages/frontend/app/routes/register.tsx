import { command, useEvents } from "@data";
import { getFormDataStringValue } from "@utils";
import { Form, useNavigate } from "react-router";

import type { Route } from "./+types/register.ts";

export async function clientAction({ request }: Route.ClientActionArgs) {
  const data = await request.formData();

  await command("RegisterCommand", {
    username: getFormDataStringValue(data, "username"),
    email: getFormDataStringValue(data, "email"),
    password: getFormDataStringValue(data, "password"),
  });
}

export const Register = () => {
  const navigate = useNavigate();

  useEvents((event) => {
    if (event.key === "RegisterSuccess") {
      void navigate("/");
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
