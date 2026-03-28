import { createAccountAdminPageActionBindings } from "./accountAdminPageActionBindings";
import { createAccountAdminPageStateResult } from "./accountAdminPageStateResult";
import { useAccountAdminActions } from "./useAccountAdminActions";
import { useAccountAdminData } from "./useAccountAdminData";
import { useAccountAdminFormState } from "./useAccountAdminFormState";

export const useAccountAdminPageState = (uid?: string) => {
  const data = useAccountAdminData(uid);
  const form = useAccountAdminFormState();

  const actions = useAccountAdminActions(
    createAccountAdminPageActionBindings({
      currentUid: uid,
      loadAccounts: data.loadAccounts,
      reportError: data.reportError,
      clearError: data.clearError,
      resetCreateForm: form.resetCreateForm,
      cancelEdit: form.cancelEdit,
      editingAccount: form.editingAccount,
      createEmail: form.createEmail,
      createPassword: form.createPassword,
      createDisplayName: form.createDisplayName,
      createIsAdmin: form.createIsAdmin,
      editDisplayName: form.editDisplayName,
      editIsAdmin: form.editIsAdmin,
    }),
  );

  return createAccountAdminPageStateResult({
    actions,
    currentUid: uid,
    data,
    form,
  });
};
