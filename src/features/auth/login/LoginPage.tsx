"use client";

import { CardPanel } from "@/components";
import { isLocalAuthEnabled } from "@/features/auth/storage";
import { isFirebaseConfigured } from "@/lib/firebase";
import { LoginAlternativeActions } from "./LoginAlternativeActions";
import { LoginCredentialForm } from "./LoginCredentialForm";
import texts from "./locales/ja.json";
import { getLoginPageModeLabel } from "./helpers";
import { useLoginPageState } from "./useLoginPageState";

/**
 * ログインページコンポーネント
 * メール/パスワードでのログイン、新規登録、テストアカウントログイン、匿名ログインをサポート
 */
export const LoginPage = () => {
  const state = useLoginPageState();
  const isLocalMode = !isFirebaseConfigured && isLocalAuthEnabled;
  const authUnavailable = !isFirebaseConfigured && !isLocalAuthEnabled;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-400 dark:to-slate-300 flex items-center justify-center p-4">
      <CardPanel className="mb-0! max-w-md w-full p-8!">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {texts.loginPage.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-700">
            {getLoginPageModeLabel(state.isSignUp)}
          </p>
        </div>
        <LoginCredentialForm
          authUnavailable={authUnavailable}
          email={state.email}
          password={state.password}
          error={state.error}
          loading={state.loading}
          isSignUp={state.isSignUp}
          onSubmit={state.handleSubmit}
          onEmailChange={state.handleEmailChange}
          onPasswordChange={state.handlePasswordChange}
        />
        <LoginAlternativeActions
          authUnavailable={authUnavailable}
          isSignUp={state.isSignUp}
          loading={state.loading}
          onToggleMode={state.toggleMode}
          onTestLogin={state.handleTestLogin}
          onAnonymousLogin={state.handleAnonymousLogin}
        />

        {isLocalMode && (
          <div className="mt-4 rounded-lg border border-sky-300 bg-sky-50 p-3 text-sm text-sky-800 dark:border-sky-400 dark:bg-sky-100 dark:text-sky-900">
            <p className="font-medium">{texts.loginPage.localModeTitle}</p>
            <p className="mt-1 whitespace-pre-line">
              {texts.loginPage.localModeDescription}
            </p>
          </div>
        )}

        {authUnavailable && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-400 dark:bg-amber-100 dark:text-amber-900">
            <p className="font-medium">
              {texts.loginPage.firebaseConfigRequiredTitle}
            </p>
            <p className="mt-1 whitespace-pre-line">
              {texts.loginPage.firebaseConfigRequiredDescription}
            </p>
          </div>
        )}

        <div className="text-center text-xs text-gray-500 dark:text-gray-600">
          <p className="mb-2">{texts.loginPage.testAccountHint}</p>
          <p>{texts.loginPage.anonymousHint}</p>
        </div>
      </CardPanel>
    </div>
  );
};
