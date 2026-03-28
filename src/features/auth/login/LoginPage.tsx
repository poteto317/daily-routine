"use client";

import { CardPanel } from "@/components";
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
          isSignUp={state.isSignUp}
          loading={state.loading}
          onToggleMode={state.toggleMode}
          onTestLogin={state.handleTestLogin}
          onAnonymousLogin={state.handleAnonymousLogin}
        />

        <div className="text-center text-xs text-gray-500 dark:text-gray-600">
          <p className="mb-2">{texts.loginPage.testAccountHint}</p>
          <p>{texts.loginPage.anonymousHint}</p>
        </div>
      </CardPanel>
    </div>
  );
};
