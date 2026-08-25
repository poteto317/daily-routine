import { LoadingIndicator } from "@/components/LoadingIndicator";
import { PAGE_LOADING_TEXT } from "./pageLoadingPresentation";

export const PageContentLoading = () => {
  return (
    <div
      className="min-h-[calc(100svh-4rem)] bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-400 dark:to-slate-300 flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingIndicator message={PAGE_LOADING_TEXT.loading} />
    </div>
  );
};
