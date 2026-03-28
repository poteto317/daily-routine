import { ACCOUNT_ADMIN_ACCESS_DENIED_TEXT } from "./helpers";

export const AccountAdminAccessDenied = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <span className="text-4xl mb-4 block">
          {ACCOUNT_ADMIN_ACCESS_DENIED_TEXT.icon}
        </span>
        <h2 className="text-lg font-bold text-red-700 mb-2">
          {ACCOUNT_ADMIN_ACCESS_DENIED_TEXT.title}
        </h2>
        <p className="text-sm text-red-600">
          {ACCOUNT_ADMIN_ACCESS_DENIED_TEXT.description}
        </p>
      </div>
    </div>
  );
};
