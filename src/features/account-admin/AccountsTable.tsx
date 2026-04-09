import type { Account } from "./types";
import {
  ACCOUNT_TABLE_DELETE_LABEL,
  ACCOUNT_TABLE_EDIT_LABEL,
  ACCOUNT_TABLE_EMPTY_LABEL,
  ACCOUNT_TABLE_TITLE_PREFIX,
  ACCOUNT_TABLE_TITLE_SUFFIX,
} from "./helpers";
import {
  getAccountCreatedDateLabel,
  getAccountDisplayNameLabel,
  getAccountEmailLabel,
  getAccountRoleLabel,
  getAccountRowClassName,
  getAccountTypeLabel,
} from "./displayHelpers";
import { isAccountSelf } from "./accountUtils";

interface AccountsTableProps {
  accounts: Account[];
  actionLoading: boolean;
  currentUid?: string;
  onStartEdit: (account: Account) => void;
  onDelete: (account: Account) => Promise<void>;
}

export const AccountsTable = ({
  accounts,
  actionLoading,
  currentUid,
  onDelete,
  onStartEdit,
}: AccountsTableProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-base font-bold text-gray-800">
          {ACCOUNT_TABLE_TITLE_PREFIX}
          {accounts.length}
          {ACCOUNT_TABLE_TITLE_SUFFIX}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  {ACCOUNT_TABLE_EMPTY_LABEL}
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr
                  key={account.uid}
                  className={getAccountRowClassName(account.uid, currentUid)}
                >
                  <td className="px-4 py-3 text-gray-800">
                    {getAccountEmailLabel(account.email)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {getAccountDisplayNameLabel(account.displayName)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getAccountRoleLabel(account.isAdmin)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getAccountTypeLabel(account)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {getAccountCreatedDateLabel(account.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onStartEdit(account)}
                        className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700"
                      >
                        {ACCOUNT_TABLE_EDIT_LABEL}
                      </button>
                      <button
                        onClick={() => onDelete(account)}
                        disabled={
                          isAccountSelf(account.uid, currentUid) ||
                          actionLoading
                        }
                        className="px-2 py-1 text-xs rounded bg-red-50 text-red-600 disabled:opacity-30"
                      >
                        {ACCOUNT_TABLE_DELETE_LABEL}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
