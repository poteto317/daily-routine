import { ACCOUNT_ADMIN_ERROR_ALERT_TEXT } from "./helpers";

interface AccountAdminErrorAlertProps {
  error: string;
  onClose: () => void;
}

export const AccountAdminErrorAlert = ({
  error,
  onClose,
}: AccountAdminErrorAlertProps) => {
  return (
    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
      <p className="text-sm text-red-700">{error}</p>
      <button
        onClick={onClose}
        className="mt-1 text-xs text-red-500 hover:text-red-700 underline"
      >
        {ACCOUNT_ADMIN_ERROR_ALERT_TEXT.close}
      </button>
    </div>
  );
};
