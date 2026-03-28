import { useCallback } from "react";
import { createAccountAdminEditFormStateResult } from "./accountAdminEditFormStateResult";
import { useAccountAdminEditFieldsState } from "./useAccountAdminEditFieldsState";
import { useAccountAdminEditingAccountState } from "./useAccountAdminEditingAccountState";
import type { Account } from "./types";

export const useAccountAdminEditFormState = () => {
  const fieldsState = useAccountAdminEditFieldsState();
  const editingState = useAccountAdminEditingAccountState();

  const startEdit = useCallback(
    (account: Account) => {
      editingState.setEditingAccount(account);
      fieldsState.setEditDisplayName(account.displayName);
      fieldsState.setEditIsAdmin(account.isAdmin);
    },
    [editingState, fieldsState],
  );

  const cancelEdit = useCallback(
    () => editingState.setEditingAccount(null),
    [editingState],
  );

  return createAccountAdminEditFormStateResult({
    fieldsState,
    editingState,
    startEdit,
    cancelEdit,
  });
};
