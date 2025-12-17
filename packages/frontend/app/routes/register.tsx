import { CurrentUserContext, Page } from "@components";
import { command, useEvent } from "@data";
import { useContext, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";

import { Button, Group, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

interface FormValues {
  username: string;
  email: string;
  password: string;
  validatePassword: string;
}

export const Register = (): ReactNode => {
  const navigate = useNavigate();
  const { currentUser, reloadUser } = useContext(CurrentUserContext);

  const form = useForm({
    initialValues: {
      username: "",
      email: "",
      password: "",
      validatePassword: ""
    } satisfies FormValues,

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      validatePassword: (value, values) =>
        value !== values.password ? "Passwords did not match" : null
    }
  });

  const onSubmit = async (values: FormValues) => {
    await command("RegisterCommand", {
      username: values.username,
      email: values.email,
      password: values.password
    });
  };

  useEffect(() => {
    void (async () => {
      if (currentUser) {
        await navigate("/");
      }
    })();
  }, [currentUser]);

  useEvent("RegisterSuccess", () => {
    reloadUser();
  });

  return (
    <Page routeName="register">
      <form method="post" onSubmit={form.onSubmit(onSubmit)}>
        <TextInput
          label="Username"
          placeholder=""
          key={form.key("username")}
          {...form.getInputProps("username")}
        />

        <TextInput
          label="Email"
          type="email"
          placeholder=""
          key={form.key("email")}
          {...form.getInputProps("email")}
        />

        <PasswordInput
          label="Password"
          placeholder=""
          key={form.key("password")}
          {...form.getInputProps("password")}
        />

        <PasswordInput
          label="Verify Password"
          placeholder=""
          key={form.key("validatePassword")}
          {...form.getInputProps("validatePassword")}
        />

        <Group mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Page>
  );
};

export default Register;
