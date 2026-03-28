import type { useAccountAdminEditFieldsState } from "./useAccountAdminEditFieldsState";
import type { useAccountAdminEditingAccountState } from "./useAccountAdminEditingAccountState";
import type { Account } from "./types";

type AccountAdminEditFieldsState = ReturnType<
  typeof useAccountAdminEditFieldsState
>;
type AccountAdminEditingAccountState = ReturnType<
  typeof useAccountAdminEditingAccountState
>;

type CreateAccountAdminEditFormStateResultArgs = {
  fieldsState: AccountAdminEditFieldsState;
  editingState: AccountAdminEditingAccountState;
  startEdit: (account: Account) => void;
  cancelEdit: () => void;
};

export const createAccountAdminEditFormStateResult = ({
  fieldsState,
  editingState,
  startEdit,
  cancelEdit,
}: CreateAccountAdminEditFormStateResultArgs) => {
  return {
    cancelEdit,
    editDisplayName: fieldsState.editDisplayName,
    editIsAdmin: fieldsState.editIsAdmin,
    editingAccount: editingState.editingAccount,
    setEditDisplayName: fieldsState.setEditDisplayName,
    setEditIsAdmin: fieldsState.setEditIsAdmin,
    startEdit,
  };
};
