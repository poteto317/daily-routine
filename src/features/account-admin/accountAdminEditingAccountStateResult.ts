import type { Dispatch, SetStateAction } from "react";
import type { Account } from "./types";

type CreateAccountAdminEditingAccountStateResultArgs = {
  editingAccount: Account | null;
  setEditingAccount: Dispatch<SetStateAction<Account | null>>;
};

export const createAccountAdminEditingAccountStateResult = ({
  editingAccount,
  setEditingAccount,
}: CreateAccountAdminEditingAccountStateResultArgs) => {
  return {
    editingAccount,
    setEditingAccount,
  };
};
