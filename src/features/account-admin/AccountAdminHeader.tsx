import { ACCOUNT_ADMIN_HEADER_TEXT } from "./helpers";

export const AccountAdminHeader = () => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {ACCOUNT_ADMIN_HEADER_TEXT.title}
      </h1>
      <p className="text-sm text-gray-500">
        {ACCOUNT_ADMIN_HEADER_TEXT.description}
      </p>
    </div>
  );
};
