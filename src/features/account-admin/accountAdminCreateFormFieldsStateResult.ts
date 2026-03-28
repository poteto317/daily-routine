import type { Dispatch, SetStateAction } from "react";

type CreateAccountAdminCreateFormFieldsStateResultArgs = {
  createDisplayName: string;
  createEmail: string;
  createIsAdmin: boolean;
  createPassword: string;
  setCreateDisplayName: Dispatch<SetStateAction<string>>;
  setCreateEmail: Dispatch<SetStateAction<string>>;
  setCreateIsAdmin: Dispatch<SetStateAction<boolean>>;
  setCreatePassword: Dispatch<SetStateAction<string>>;
};

export const createAccountAdminCreateFormFieldsStateResult = ({
  createDisplayName,
  createEmail,
  createIsAdmin,
  createPassword,
  setCreateDisplayName,
  setCreateEmail,
  setCreateIsAdmin,
  setCreatePassword,
}: CreateAccountAdminCreateFormFieldsStateResultArgs) => {
  return {
    createDisplayName,
    createEmail,
    createIsAdmin,
    createPassword,
    setCreateDisplayName,
    setCreateEmail,
    setCreateIsAdmin,
    setCreatePassword,
  };
};
