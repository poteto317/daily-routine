import { useApiKeyState } from "@/features/api-key";
import texts from "@/features/api-key/locales/ja.json";

const getStatusLabel = (hasKey: boolean | null): string => {
  if (hasKey === null) return texts.statusLoading;
  return hasKey ? texts.statusIssued : texts.statusNone;
};

export const ApiKeySection = () => {
  const {
    hasKey,
    issuedKey,
    isWorking,
    error,
    copied,
    handleIssue,
    handleRevoke,
    handleCopy,
  } = useApiKeyState();

  return (
    <div className="border-t pt-6 dark:border-gray-300">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-black mb-2">
        {texts.title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-700 mb-4">
        {texts.description}
      </p>

      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-800">
            {texts.statusLabel}
          </span>
          <span className="text-sm text-gray-900 dark:text-black">
            {getStatusLabel(hasKey)}
          </span>
        </div>

        {issuedKey && (
          <div className="mt-3">
            <p className="p-2 bg-yellow-100 dark:bg-yellow-200 border border-yellow-300 rounded text-xs text-yellow-800 dark:text-yellow-900">
              {texts.issuedNotice}
            </p>
            <label className="block mt-3 text-xs text-gray-600 dark:text-gray-700">
              {texts.issuedKeyLabel}
              <input
                readOnly
                value={issuedKey}
                onFocus={(event) => event.currentTarget.select()}
                className="mt-1 w-full rounded border border-gray-300 bg-white p-2 font-mono text-xs text-gray-900"
              />
            </label>
            <button
              type="button"
              onClick={handleCopy}
              className="mt-2 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
            >
              {texts.copyButton}
            </button>
            {copied && (
              <span className="ml-2 text-xs text-emerald-700">
                {texts.copiedLabel}
              </span>
            )}
          </div>
        )}

        {error && (
          <div className="mt-2 p-2 bg-red-100 dark:bg-red-200 border border-red-300 rounded text-xs text-red-800 dark:text-red-900">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleIssue}
          disabled={isWorking || hasKey === null}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {hasKey ? texts.reissueButton : texts.issueButton}
        </button>
        {hasKey && (
          <button
            type="button"
            onClick={handleRevoke}
            disabled={isWorking}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {texts.revokeButton}
          </button>
        )}
      </div>
    </div>
  );
};
