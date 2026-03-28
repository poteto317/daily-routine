import type { useAccountAdminActions } from "./useAccountAdminActions";
import type { useAccountAdminData } from "./useAccountAdminData";
import type { useAccountAdminFormState } from "./useAccountAdminFormState";

type AccountAdminPageStateResultArgs = {
  actions: ReturnType<typeof useAccountAdminActions>;
  currentUid?: string;
  data: ReturnType<typeof useAccountAdminData>;
  form: ReturnType<typeof useAccountAdminFormState>;
};

export const createAccountAdminPageStateResult = ({
  actions,
  currentUid,
  data,
  form,
}: AccountAdminPageStateResultArgs) => {
  return {
    ...data,
    ...form,
    ...actions,
    currentUid,
  };
};
