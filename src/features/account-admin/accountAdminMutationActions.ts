import { deleteAccountRecord, updateAccountRecord } from "./accountService";
import { isAccountSelf } from "./accountUtils";
import type { Account, UpdateAccountInput } from "./types";

interface UpdateParams {
  editingAccount: Account;
  editDisplayName: string;
  editIsAdmin: boolean;
}

export const executeUpdateAccount = async ({
  editDisplayName,
  editIsAdmin,
  editingAccount,
}: UpdateParams): Promise<void> => {
  const updateData: UpdateAccountInput = {
    displayName: editDisplayName,
    isAdmin: editIsAdmin,
  };

  await updateAccountRecord(editingAccount.uid, updateData);
};

interface DeleteParams {
  account: Account;
  currentUid?: string;
}

export const executeDeleteAccount = async ({
  account,
  currentUid,
}: DeleteParams): Promise<void> => {
  if (isAccountSelf(account.uid, currentUid)) return;

  await deleteAccountRecord(account.uid);
};
