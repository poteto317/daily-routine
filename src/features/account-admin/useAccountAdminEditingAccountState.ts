import { useState } from "react";
import type { Account } from "./types";
import { createAccountAdminEditingAccountStateResult } from "./accountAdminEditingAccountStateResult";

export const useAccountAdminEditingAccountState = () => {
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  return createAccountAdminEditingAccountStateResult({
    editingAccount,
    setEditingAccount,
  });
};
