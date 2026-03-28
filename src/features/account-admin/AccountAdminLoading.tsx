import { LoadingIndicator } from "@/components";
import { ACCOUNT_ADMIN_HEADER_TEXT } from "./helpers";

export const AccountAdminLoading = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <LoadingIndicator
        message={ACCOUNT_ADMIN_HEADER_TEXT.loading}
        containerClassName="flex items-center justify-center py-12"
        spinnerClassName="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        messageClassName="ml-3 text-gray-600"
      />
    </div>
  );
};
