import { type ChangeEvent, useEffect, useState } from "react";

interface NewPasswordInputProps {
  onChange: (password: string) => void;
}

export const NewPasswordInput = ({ onChange }: NewPasswordInputProps) => {
  const [password, setPassword] = useState<string>("");
  const [matchPassword, setMatchPassword] = useState<string>("");

  const valid = password === matchPassword;

  const onPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const onMatchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMatchPassword(event.target.value);
  };

  useEffect(() => {
    if (valid) {
      onChange(password);
    }
  }, [valid, password]);

  return (
    <>
      <label htmlFor="password">
        Password
        <input
          aria-invalid={!valid}
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={onPasswordChange}
        />
      </label>
      <label htmlFor="match-password">
        Verify your passsword
        <input
          aria-invalid={!valid}
          name="match-password"
          type="password"
          placeholder="Verify"
          value={matchPassword}
          onChange={onMatchChange}
        />
      </label>
    </>
  );
};
