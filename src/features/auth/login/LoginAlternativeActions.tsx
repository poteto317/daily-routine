import texts from "./locales/ja.json";
import { getLoginAlternativeToggleLabel } from "./helpers";

interface LoginAlternativeActionsProps {
  isSignUp: boolean;
  loading: boolean;
  onToggleMode: () => void;
  onAnonymousLogin: () => Promise<void>;
  onTestLogin: (() => Promise<void>) | null;
}

export const LoginAlternativeActions = ({
  isSignUp,
  loading,
  onAnonymousLogin,
  onTestLogin,
  onToggleMode,
}: LoginAlternativeActionsProps) => {
  return (
    <div className="space-y-3">
      <div className="text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-blue-600 dark:text-blue-700 hover:underline text-sm"
          disabled={loading}
        >
          {getLoginAlternativeToggleLabel(isSignUp)}
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-400"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-100 px-2 text-gray-500 dark:text-gray-600">
            {texts.loginAlternativeActions.separator}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onAnonymousLogin}
        disabled={loading}
        className="w-full bg-gray-100 dark:bg-gray-200 hover:bg-gray-200 dark:hover:bg-gray-300 disabled:opacity-50 text-gray-700 dark:text-gray-800 font-medium py-3 rounded-lg transition-colors"
      >
        {texts.loginAlternativeActions.anonymousLabel}
      </button>

      {onTestLogin && (
        <button
          type="button"
          onClick={onTestLogin}
          disabled={loading}
          className="w-full bg-yellow-100 dark:bg-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-300 disabled:opacity-50 text-yellow-800 dark:text-yellow-900 font-medium py-3 rounded-lg transition-colors text-sm"
        >
          {texts.loginAlternativeActions.testAccountLabel}
        </button>
      )}
    </div>
  );
};
