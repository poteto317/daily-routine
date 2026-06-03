import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import type { User } from "firebase/auth";
import { AuthGuard } from "./AuthGuard";
import { AuthContext } from "@/features/auth/context/AuthContextInstance";
import type { AuthContextType } from "@/features/auth/context/types";

// AuthGuard は useAuth() を呼び出し、認証状態に応じて3通りの表示を切り替える。
//   loading=true         → FullScreenLoading
//   user=null, loading=false → LoginPage（LoginPage 内でも useAuth() が必要なので
//                              AuthContext.Provider でラップする）
//   user 存在, loading=false → children をそのまま描画
//
// AuthContext.Provider で各状態を注入することで全パターンをカバーする。

const mockUser = {
  isAnonymous: false,
  email: "user@example.com",
} as User;

const buildMockAuthValue = (
  overrides: Partial<AuthContextType>,
): AuthContextType => ({
  user: null,
  loading: false,
  isAdmin: false,
  isAdminLoading: false,
  signIn: fn(),
  signUp: fn(),
  signOut: fn(),
  signInAnonymous: fn(),
  signInAsTestUser: fn(),
  ...overrides,
});

const withLoadingAuth: Decorator = (Story) => (
  <AuthContext.Provider value={buildMockAuthValue({ loading: true })}>
    <Story />
  </AuthContext.Provider>
);

const withUnauthenticated: Decorator = (Story) => (
  <AuthContext.Provider value={buildMockAuthValue({ user: null })}>
    <Story />
  </AuthContext.Provider>
);

const withAuthenticated: Decorator = (Story) => (
  <AuthContext.Provider value={buildMockAuthValue({ user: mockUser })}>
    <Story />
  </AuthContext.Provider>
);

const meta = {
  title: "Components/AuthGuard",
  component: AuthGuard,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AuthGuard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 認証状態確認中: FullScreenLoading が表示される */
export const Loading: Story = {
  args: { children: <p>Protected content</p> },
  decorators: [withLoadingAuth],
};

/** 未認証: LoginPage が表示される（Firebase 未設定のため authUnavailable バナー） */
export const Unauthenticated: Story = {
  args: { children: <p>Protected content</p> },
  decorators: [withUnauthenticated],
};

/** 認証済み: children がそのまま表示される */
export const Authenticated: Story = {
  args: {
    children: (
      <div className="p-8 text-gray-800 dark:text-gray-100">
        <p className="text-lg font-semibold">🔓 認証済みコンテンツ</p>
        <p className="text-sm mt-2 text-gray-500">
          ログイン済みユーザーのみに表示されます。
        </p>
      </div>
    ),
  },
  decorators: [withAuthenticated],
};
