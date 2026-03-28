interface ErrorAlertProps {
  error: string;
  onRetry?: () => void;
  retryButtonText?: string;
}

/**
 * 共通のエラー表示コンポーネント
 * エラーメッセージとオプションで再試行ボタンを表示
 */
export const ErrorAlert = ({
  error,
  onRetry,
  retryButtonText = "再試行",
}: ErrorAlertProps) => {
  return (
    <div className="bg-red-50 dark:bg-red-100 border border-red-200 dark:border-red-300 rounded-lg p-4">
      <p className="text-red-800 dark:text-red-900 text-sm mb-2">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-red-600 dark:text-red-700 text-sm font-medium hover:text-red-800 dark:hover:text-red-900 underline"
        >
          {retryButtonText}
        </button>
      )}
    </div>
  );
};
