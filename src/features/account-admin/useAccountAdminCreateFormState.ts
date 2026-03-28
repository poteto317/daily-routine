import { useCallback } from "react";
import { createAccountAdminCreateFormStateResult } from "./accountAdminCreateFormStateResult";
import { useAccountAdminCreateFormFieldsState } from "./useAccountAdminCreateFormFieldsState";
import { useAccountAdminCreateFormVisibilityState } from "./useAccountAdminCreateFormVisibilityState";

export const useAccountAdminCreateFormState = () => {
  const fieldsState = useAccountAdminCreateFormFieldsState();
  const visibilityState = useAccountAdminCreateFormVisibilityState();

  const resetCreateForm = useCallback(() => {
    fieldsState.setCreateEmail("");
    fieldsState.setCreatePassword("");
    fieldsState.setCreateDisplayName("");
    fieldsState.setCreateIsAdmin(false);
    visibilityState.setShowCreateForm(false);
  }, [fieldsState, visibilityState]);

  return createAccountAdminCreateFormStateResult({
    fieldsState,
    visibilityState,
    resetCreateForm,
  });
};
