import { useState } from "react";
import { createLoginCredentialsStateResult } from "./loginCredentialsStateResult";

export const useLoginCredentialsState = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return createLoginCredentialsStateResult({
    email,
    password,
    setEmail,
    setPassword,
  });
};
