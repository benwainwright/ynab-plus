import { Page } from "@components";
import { useUser } from "@data";
import { useParams } from "react-router";
import { useForm } from "@mantine/form";
import { Button, Group, PasswordInput, TextInput } from "@mantine/core";

interface FormValues {
  email: string;
  password: string;
  validatePassword: string;
}

export const EditUser = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, setUser, saveUser } = useUser(userId);

  const form = useForm({
    initialValues: {
      email: user?.email ?? "",
      password: "",
      validatePassword: "",
    } satisfies FormValues,

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      validatePassword: (value, values) =>
        value !== values.password ? "Passwords did not match" : null,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setUser({
      email: values.email,
      password: values.password,
      permissions: [],
    });
    await saveUser();
  };

  return (
    <Page routeName="editUser">
      <form method="post" onSubmit={form.onSubmit(onSubmit)}>
        <TextInput
          label="Username"
          placeholder=""
          key={form.key("username")}
          value={userId}
          disabled
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

        <Group justify="flex-end" mt="md">
          <Button type="submit">Update</Button>
        </Group>
      </form>
    </Page>
  );
};

export default EditUser;
