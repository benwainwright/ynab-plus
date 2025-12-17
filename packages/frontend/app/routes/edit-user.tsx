import { Page } from "@components";
import { useUser } from "@data";
import { useParams } from "react-router";
import { useForm } from "@mantine/form";
import { Button, Chip, Fieldset, Group, PasswordInput, TextInput } from "@mantine/core";
import { type ReactNode, useEffect } from "react";
import { permissions, type Permission } from "@ynab-plus/domain";

interface FormValues {
  email: string;
  password: string;
  permissions: Permission[];
  validatePassword: string;
}

export const EditUser = (): ReactNode => {
  const { userId } = useParams<{ userId: string }>();
  const { user, saveUser, isPending } = useUser(userId);

  const form = useForm({
    initialValues: {
      email: user?.email ?? "",
      password: "",
      permissions: [] as Permission[],
      validatePassword: ""
    } satisfies FormValues,

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      validatePassword: (value, values) =>
        value !== values.password ? "Passwords did not match" : null
    }
  });

  useEffect(() => {
    if (!isPending && user) {
      form.setValues({
        email: user.email,
        permissions: user.permissions
      });
      form.resetDirty();
    }
  }, [isPending]);

  const onSubmit = async (values: FormValues) => {
    await saveUser({
      email: values.email,
      password: values.password,
      permissions: values.permissions
    });
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

        <Fieldset mt="md" legend="Permissions" pt="md">
          <Group>
            {permissions.map((permission) => (
              <Chip
                checked={form.values.permissions.includes(permission)}
                onChange={(checked) => {
                  form.setValues((previous) => {
                    if (checked && !previous.permissions?.includes(permission)) {
                      return {
                        ...previous,
                        permissions: [...(previous.permissions ?? []), permission]
                      };
                    } else if (!checked) {
                      return {
                        ...previous,
                        permissions:
                          previous.permissions?.filter(
                            (thePermission) => thePermission !== permission
                          ) ?? []
                      };
                    }

                    return previous;
                  });
                }}
              >
                {permission}
              </Chip>
            ))}
          </Group>
        </Fieldset>
        <Group justify="flex-end" mt="md">
          <Button type="submit" disabled={!form.isDirty()}>
            Update
          </Button>
        </Group>
      </form>
    </Page>
  );
};

export default EditUser;
