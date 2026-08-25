import { PAGE_LOADING_TEXT } from "./pageLoadingPresentation";

type PageLoadErrorFallbackProps = {
  onNavigateHomeAction: () => void;
};

export const PageLoadErrorFallback = ({
  onNavigateHomeAction,
}: PageLoadErrorFallbackProps) => {
  return (
    <div
      className="min-h-[calc(100svh-4rem)] bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-400 dark:to-slate-300 flex items-center justify-center px-4"
      role="alert"
    >
      <div className="max-w-md rounded-xl bg-white p-6 text-center shadow-md dark:bg-slate-100">
        <h2 className="text-lg font-bold text-gray-900">
          {PAGE_LOADING_TEXT.error}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {PAGE_LOADING_TEXT.errorHint}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <form action="/" method="get">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              {PAGE_LOADING_TEXT.reload}
            </button>
          </form>
          <button
            type="button"
            onClick={onNavigateHomeAction}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            {PAGE_LOADING_TEXT.backHome}
          </button>
        </div>
      </div>
    </div>
  );
};
