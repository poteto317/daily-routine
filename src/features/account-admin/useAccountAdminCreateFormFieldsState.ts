import { useState } from "react";
import { createAccountAdminCreateFormFieldsStateResult } from "./accountAdminCreateFormFieldsStateResult";

export const useAccountAdminCreateFormFieldsState = () => {
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createDisplayName, setCreateDisplayName] = useState("");
  const [createIsAdmin, setCreateIsAdmin] = useState(false);

  return createAccountAdminCreateFormFieldsStateResult({
    createDisplayName,
    createEmail,
    createIsAdmin,
    createPassword,
    setCreateDisplayName,
    setCreateEmail,
    setCreateIsAdmin,
    setCreatePassword,
  });
};
