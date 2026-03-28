import type { Dispatch, SetStateAction } from "react";
import type { Account } from "./types";

type CreateAccountAdminAccountListStateResultArgs = {
  accounts: Account[];
  setAccounts: Dispatch<SetStateAction<Account[]>>;
};

export const createAccountAdminAccountListStateResult = ({
  accounts,
  setAccounts,
}: CreateAccountAdminAccountListStateResultArgs) => {
  return {
    accounts,
    setAccounts,
  };
};
