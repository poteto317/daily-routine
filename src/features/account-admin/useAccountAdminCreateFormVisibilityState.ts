import { useCallback, useState } from "react";
import { createAccountAdminCreateFormVisibilityStateResult } from "./accountAdminCreateFormVisibilityStateResult";

export const useAccountAdminCreateFormVisibilityState = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const closeCreateForm = useCallback(() => setShowCreateForm(false), []);

  const toggleCreateForm = useCallback(() => {
    setShowCreateForm((prev) => !prev);
  }, []);

  return createAccountAdminCreateFormVisibilityStateResult({
    closeCreateForm,
    setShowCreateForm,
    showCreateForm,
    toggleCreateForm,
  });
};
