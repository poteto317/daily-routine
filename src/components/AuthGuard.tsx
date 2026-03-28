"use client";

import { useAuth } from "@/features/auth";
import { LoginPage } from "@/features/auth";
import { FullScreenLoading } from "./FullScreenLoading";
import texts from "./locales/ja.json";

/**
 * 認証保護コンポーネント
 * ユーザーの認証状態を確認し、未認証の場合はログインページを表示する
 * ログイン済みの場合は子要素（保護されたコンテンツ）を表示する
 * ページの読み込み中はローディング画面を表示する
 * @component
 * @param {Object} props - コンポーネントのプロパティ
 * @param {React.ReactNode} props.children - 保護されたコンテンツ（ログイン後に表示される）
 * @returns {JSX.Element} 認証状態に応じたコンポーネント
 * @example
 * <AuthGuard>
 *   <ProtectedPage />
 * </AuthGuard>
 */
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoading message={texts.authGuard.loading} />;

  if (!user) return <LoginPage />;

  return <>{children}</>;
};
