import {
  ACCOUNT_ADMIN_CHECKBOX_LABEL,
  ACCOUNT_CREATE_CANCEL_LABEL,
  ACCOUNT_CREATE_SUBMIT_LABEL,
  ACCOUNT_CREATE_SUBMIT_LOADING_LABEL,
  ACCOUNT_CREATE_TITLE,
  ACCOUNT_EMAIL_PLACEHOLDER,
  ACCOUNT_NAME_PLACEHOLDER,
  ACCOUNT_PASSWORD_PLACEHOLDER,
} from "./helpers";

interface AccountCreateFormProps {
  actionLoading: boolean;
  createEmail: string;
  createPassword: string;
  createDisplayName: string;
  createIsAdmin: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  setCreateEmail: (value: string) => void;
  setCreatePassword: (value: string) => void;
  setCreateDisplayName: (value: string) => void;
  setCreateIsAdmin: (value: boolean) => void;
}

export const AccountCreateForm = ({
  actionLoading,
  createDisplayName,
  createEmail,
  createIsAdmin,
  createPassword,
  onCancel,
  onSubmit,
  setCreateDisplayName,
  setCreateEmail,
  setCreateIsAdmin,
  setCreatePassword,
}: AccountCreateFormProps) => {
  return (
    <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        {ACCOUNT_CREATE_TITLE}
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          value={createEmail}
          onChange={(e) => setCreateEmail(e.target.value)}
          required
          placeholder={ACCOUNT_EMAIL_PLACEHOLDER}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <input
          type="password"
          value={createPassword}
          onChange={(e) => setCreatePassword(e.target.value)}
          required
          minLength={6}
          placeholder={ACCOUNT_PASSWORD_PLACEHOLDER}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <input
          type="text"
          value={createDisplayName}
          onChange={(e) => setCreateDisplayName(e.target.value)}
          placeholder={ACCOUNT_NAME_PLACEHOLDER}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={createIsAdmin}
            onChange={(e) => setCreateIsAdmin(e.target.checked)}
            className="rounded border-gray-300"
          />
          {ACCOUNT_ADMIN_CHECKBOX_LABEL}
        </label>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={actionLoading}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white disabled:opacity-50"
          >
            {actionLoading
              ? ACCOUNT_CREATE_SUBMIT_LOADING_LABEL
              : ACCOUNT_CREATE_SUBMIT_LABEL}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white"
          >
            {ACCOUNT_CREATE_CANCEL_LABEL}
          </button>
        </div>
      </form>
    </div>
  );
};
