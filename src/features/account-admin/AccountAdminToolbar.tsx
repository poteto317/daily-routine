import { ACCOUNT_ADMIN_TOOLBAR_TEXT } from "./helpers";

interface AccountAdminToolbarProps {
  onToggleCreateForm: () => void;
  onRefresh: () => Promise<void>;
}

export const AccountAdminToolbar = ({
  onRefresh,
  onToggleCreateForm,
}: AccountAdminToolbarProps) => {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <button
        onClick={onToggleCreateForm}
        className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
      >
        {ACCOUNT_ADMIN_TOOLBAR_TEXT.createAccount}
      </button>
      <button
        onClick={onRefresh}
        className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
      >
        {ACCOUNT_ADMIN_TOOLBAR_TEXT.refresh}
      </button>
    </div>
  );
};
