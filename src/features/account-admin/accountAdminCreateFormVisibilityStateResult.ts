import type { Dispatch, SetStateAction } from "react";

type CreateAccountAdminCreateFormVisibilityStateResultArgs = {
  closeCreateForm: () => void;
  setShowCreateForm: Dispatch<SetStateAction<boolean>>;
  showCreateForm: boolean;
  toggleCreateForm: () => void;
};

export const createAccountAdminCreateFormVisibilityStateResult = ({
  closeCreateForm,
  setShowCreateForm,
  showCreateForm,
  toggleCreateForm,
}: CreateAccountAdminCreateFormVisibilityStateResultArgs) => {
  return {
    closeCreateForm,
    setShowCreateForm,
    showCreateForm,
    toggleCreateForm,
  };
};
