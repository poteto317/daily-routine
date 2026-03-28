import type { useAccountAdminCreateFormFieldsState } from "./useAccountAdminCreateFormFieldsState";
import type { useAccountAdminCreateFormVisibilityState } from "./useAccountAdminCreateFormVisibilityState";

type AccountAdminCreateFormFieldsState = ReturnType<
  typeof useAccountAdminCreateFormFieldsState
>;
type AccountAdminCreateFormVisibilityState = ReturnType<
  typeof useAccountAdminCreateFormVisibilityState
>;

type CreateAccountAdminCreateFormStateResultArgs = {
  fieldsState: AccountAdminCreateFormFieldsState;
  visibilityState: AccountAdminCreateFormVisibilityState;
  resetCreateForm: () => void;
};

export const createAccountAdminCreateFormStateResult = ({
  fieldsState,
  visibilityState,
  resetCreateForm,
}: CreateAccountAdminCreateFormStateResultArgs) => {
  return {
    closeCreateForm: visibilityState.closeCreateForm,
    createDisplayName: fieldsState.createDisplayName,
    createEmail: fieldsState.createEmail,
    createIsAdmin: fieldsState.createIsAdmin,
    createPassword: fieldsState.createPassword,
    resetCreateForm,
    setCreateDisplayName: fieldsState.setCreateDisplayName,
    setCreateEmail: fieldsState.setCreateEmail,
    setCreateIsAdmin: fieldsState.setCreateIsAdmin,
    setCreatePassword: fieldsState.setCreatePassword,
    showCreateForm: visibilityState.showCreateForm,
    toggleCreateForm: visibilityState.toggleCreateForm,
  };
};
