import type { Dispatch, SetStateAction } from "react";

type CreateAccountAdminActionStateResultArgs = {
  actionLoading: boolean;
  setActionLoading: Dispatch<SetStateAction<boolean>>;
};

export const createAccountAdminActionStateResult = ({
  actionLoading,
  setActionLoading,
}: CreateAccountAdminActionStateResultArgs) => {
  return {
    actionLoading,
    setActionLoading,
  };
};
