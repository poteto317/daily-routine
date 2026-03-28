import { useState } from "react";
import { createAccountAdminEditFieldsStateResult } from "./accountAdminEditFieldsStateResult";

export const useAccountAdminEditFieldsState = () => {
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editIsAdmin, setEditIsAdmin] = useState(false);

  return createAccountAdminEditFieldsStateResult({
    editDisplayName,
    editIsAdmin,
    setEditDisplayName,
    setEditIsAdmin,
  });
};
