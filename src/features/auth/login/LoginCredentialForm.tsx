import texts from "./locales/ja.json";
import { getLoginSubmitLabel } from "./helpers";

interface LoginCredentialFormProps {
  email: string;
  password: string;
  error: string | null;
  loading: boolean;
  isSignUp: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}

export const LoginCredentialForm = ({
  email,
  error,
  isSignUp,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  password,
}: LoginCredentialFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mb-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1"
        >
          {texts.loginCredentialForm.emailLabel}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-white text-gray-900"
          placeholder={texts.loginCredentialForm.emailPlaceholder}
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1"
        >
          {texts.loginCredentialForm.passwordLabel}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-white text-gray-900"
          placeholder={texts.loginCredentialForm.passwordPlaceholder}
          disabled={loading}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-100 border border-red-300 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {getLoginSubmitLabel(loading, isSignUp)}
      </button>
    </form>
  );
};
