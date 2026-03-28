import { useMemo } from "react";
import { createAccountAdminFormStateResult } from "./accountAdminFormStateResult";
import { createAccountAdminToggleCreateFormAction } from "./accountAdminFormToggleAction";
import { useAccountAdminCreateFormState } from "./useAccountAdminCreateFormState";
import { useAccountAdminEditFormState } from "./useAccountAdminEditFormState";

export const useAccountAdminFormState = () => {
  const createForm = useAccountAdminCreateFormState();
  const editForm = useAccountAdminEditFormState();
  const { toggleCreateForm: toggleCreateFormBase } = createForm;
  const { cancelEdit } = editForm;

  const toggleCreateForm = useMemo(
    () =>
      createAccountAdminToggleCreateFormAction({
        cancelEdit,
        toggleCreateFormBase,
      }),
    [cancelEdit, toggleCreateFormBase],
  );

  return createAccountAdminFormStateResult({
    createForm,
    editForm,
    toggleCreateForm,
  });
};
