import texts from "../locales/ja.json";
import { useApiKeyState } from "../useApiKeyState";
import { ApiKeyActionButtons } from "./ApiKeyActionButtons";
import { ApiKeyStatusRow } from "./ApiKeyStatusRow";
import { IssuedApiKeyPanel } from "./IssuedApiKeyPanel";

export const ApiKeyPanel = () => {
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
        <ApiKeyStatusRow hasKey={hasKey} />
        {issuedKey && (
          <IssuedApiKeyPanel
            issuedKey={issuedKey}
            copied={copied}
            onCopy={handleCopy}
          />
        )}
        {error && (
          <div
            role="alert"
            className="mt-2 p-2 bg-red-100 dark:bg-red-200 border border-red-300 rounded text-xs text-red-800 dark:text-red-900"
          >
            {error}
          </div>
        )}
      </div>

      <ApiKeyActionButtons
        hasKey={hasKey}
        isWorking={isWorking}
        onIssue={handleIssue}
        onRevoke={handleRevoke}
      />
    </div>
  );
};
