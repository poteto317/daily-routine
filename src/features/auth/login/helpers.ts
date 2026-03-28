/**
 * ログインページ用ヘルパー関数
 */

import texts from "./locales/ja.json";

/**
 * サインアップ/ログインモードに応じたページラベルを取得
 */
export const getLoginPageModeLabel = (isSignUp: boolean): string =>
  isSignUp ? texts.loginPage.signUpModeLabel : texts.loginPage.loginModeLabel;

/**
 * サインアップ/ログインモードに応じた切り替えラベルを取得
 */
export const getLoginAlternativeToggleLabel = (isSignUp: boolean): string =>
  isSignUp
    ? texts.loginAlternativeActions.loginToggle
    : texts.loginAlternativeActions.signUpToggle;

/**
 * ローディング状態とモードに応じた送信ボタンラベルを取得
 */
export const getLoginSubmitLabel = (
  isLoading: boolean,
  isSignUp: boolean,
): string => {
  if (isLoading) return texts.loginCredentialForm.submitLoadingLabel;

  return isSignUp
    ? texts.loginCredentialForm.signUpLabel
    : texts.loginCredentialForm.signInLabel;
};
