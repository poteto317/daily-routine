import { useState } from "react";
import type { Account } from "./types";
import { createAccountAdminAccountListStateResult } from "./accountAdminAccountListStateResult";

export const useAccountAdminAccountListState = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);

  return createAccountAdminAccountListStateResult({
    accounts,
    setAccounts,
  });
};
