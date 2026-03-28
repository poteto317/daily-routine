import type { Dispatch, SetStateAction } from "react";

type CreateLoginCredentialsStateResultArgs = {
  email: string;
  password: string;
  setEmail: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
};

export const createLoginCredentialsStateResult = ({
  email,
  password,
  setEmail,
  setPassword,
}: CreateLoginCredentialsStateResultArgs) => {
  return {
    email,
    password,
    setEmail,
    setPassword,
  };
};
