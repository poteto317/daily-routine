import { isAccountSelf } from "./accountUtils";
import { Account } from "./types";
import {
  ACCOUNT_EDIT_ADMIN_LABEL,
  ACCOUNT_EDIT_CANCEL_LABEL,
  ACCOUNT_EDIT_NAME_PLACEHOLDER,
  ACCOUNT_EDIT_SELF_DISABLED_LABEL,
  ACCOUNT_EDIT_SUBMIT_LABEL,
  ACCOUNT_EDIT_SUBMIT_LOADING_LABEL,
  ACCOUNT_EDIT_TITLE_PREFIX,
} from "./helpers";

interface AccountEditFormProps {
  actionLoading: boolean;
  currentUid?: string;
  editingAccount: Account;
  editDisplayName: string;
  editIsAdmin: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  setEditDisplayName: (value: string) => void;
  setEditIsAdmin: (value: boolean) => void;
}

export const AccountEditForm = ({
  actionLoading,
  currentUid,
  editingAccount,
  editDisplayName,
  editIsAdmin,
  onCancel,
  onSubmit,
  setEditDisplayName,
  setEditIsAdmin,
}: AccountEditFormProps) => {
  const isSelf = isAccountSelf(editingAccount.uid, currentUid);

  return (
    <div className="mb-6 bg-white rounded-xl shadow-sm border border-blue-200 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        {ACCOUNT_EDIT_TITLE_PREFIX} {editingAccount.email}
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          value={editDisplayName}
          onChange={(e) => setEditDisplayName(e.target.value)}
          placeholder={ACCOUNT_EDIT_NAME_PLACEHOLDER}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={editIsAdmin}
            onChange={(e) => setEditIsAdmin(e.target.checked)}
            disabled={isSelf}
            className="rounded border-gray-300"
          />
          {ACCOUNT_EDIT_ADMIN_LABEL}
          {isSelf && (
            <span className="text-gray-400">
              {ACCOUNT_EDIT_SELF_DISABLED_LABEL}
            </span>
          )}
        </label>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={actionLoading}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white disabled:opacity-50"
          >
            {actionLoading
              ? ACCOUNT_EDIT_SUBMIT_LOADING_LABEL
              : ACCOUNT_EDIT_SUBMIT_LABEL}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white"
          >
            {ACCOUNT_EDIT_CANCEL_LABEL}
          </button>
        </div>
      </form>
    </div>
  );
};
