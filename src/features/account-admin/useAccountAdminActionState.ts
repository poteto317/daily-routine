import { useState } from "react";
import { createAccountAdminActionStateResult } from "./accountAdminActionStateResult";

export const useAccountAdminActionState = () => {
  const [actionLoading, setActionLoading] = useState(false);

  return createAccountAdminActionStateResult({
    actionLoading,
    setActionLoading,
  });
};
