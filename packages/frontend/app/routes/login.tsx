import { CurrentUserContext, Page } from "@components";
import { command, useEvent } from "@data";
import {
  Button,
  Group,
  PasswordInput,
  TextInput,
  Text,
  Anchor,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router";

interface FormValues {
  username: string;
  password: string;
}

export const Login = () => {
  const { currentUser, reloadUser } = useContext(CurrentUserContext);
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    } satisfies FormValues,
  });

  useEffect(() => {
    void (async () => {
      if (currentUser) {
        await navigate("/");
      }
    })();
  }, [currentUser]);

  const onSubmit = async (values: FormValues) => {
    await command("LoginCommand", {
      username: values.username,
      password: values.password,
    });
  };

  useEvent("LoginSuccess", () => {
    reloadUser();
  });

  return (
    <Page routeName="login">
      <form method="post" onSubmit={form.onSubmit(onSubmit)}>
        <TextInput
          label="Username"
          placeholder=""
          key={form.key("username")}
          {...form.getInputProps("username")}
        />

        <PasswordInput
          label="Password"
          placeholder=""
          key={form.key("password")}
          {...form.getInputProps("password")}
        />

        <Group mt="md" mb="md">
          <Button type="submit">Login</Button>
        </Group>
        <Text>
          Or you can{" "}
          <Anchor to="/register" component={Link}>
            register
          </Anchor>{" "}
          a new account...
        </Text>
      </form>
    </Page>
  );
};

export default Login;
