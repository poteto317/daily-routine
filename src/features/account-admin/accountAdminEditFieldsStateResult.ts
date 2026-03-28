import type { Dispatch, SetStateAction } from "react";

type CreateAccountAdminEditFieldsStateResultArgs = {
  editDisplayName: string;
  editIsAdmin: boolean;
  setEditDisplayName: Dispatch<SetStateAction<string>>;
  setEditIsAdmin: Dispatch<SetStateAction<boolean>>;
};

export const createAccountAdminEditFieldsStateResult = ({
  editDisplayName,
  editIsAdmin,
  setEditDisplayName,
  setEditIsAdmin,
}: CreateAccountAdminEditFieldsStateResultArgs) => {
  return {
    editDisplayName,
    editIsAdmin,
    setEditDisplayName,
    setEditIsAdmin,
  };
};
