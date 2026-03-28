import type { useAccountAdminCreateFormState } from "./useAccountAdminCreateFormState";
import type { useAccountAdminEditFormState } from "./useAccountAdminEditFormState";

type AccountAdminFormStateResultArgs = {
  createForm: ReturnType<typeof useAccountAdminCreateFormState>;
  editForm: ReturnType<typeof useAccountAdminEditFormState>;
  toggleCreateForm: () => void;
};

export const createAccountAdminFormStateResult = ({
  createForm,
  editForm,
  toggleCreateForm,
}: AccountAdminFormStateResultArgs) => {
  return {
    ...createForm,
    ...editForm,
    toggleCreateForm,
  };
};
