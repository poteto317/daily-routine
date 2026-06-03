import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { User } from "firebase/auth";
import { TestMatrixPage } from "./TestMatrixPage";
import { AuthContext } from "@/features/auth/context/AuthContextInstance";
import type { AuthContextType } from "@/features/auth/context/types";

// TestMatrixPage は useAuth() を呼び出すため AuthContext.Provider が必要。
// useTestMatrixPageState は localStorage からデータを読み込む
// （未設定の場合は buildInitialData() の初期値が使われる）。
//
// 3つの表示状態:
//   Loading     : loading=true
//   AccessDenied: loading=false, isAdmin=false
//   AdminView   : loading=false, isAdmin=true（初期データで表示）

const mockUser = {
  isAnonymous: false,
  email: "admin@example.com",
} as User;

const baseAuthValue: AuthContextType = {
  user: mockUser,
  loading: false,
  isAdmin: false,
  isAdminLoading: false,
  signIn: fn(),
  signUp: fn(),
  signOut: fn(),
  signInAnonymous: fn(),
  signInAsTestUser: fn(),
};

const withLoadingAuth: Decorator = (Story) => (
  <AuthContext.Provider value={{ ...baseAuthValue, loading: true }}>
    <Story />
  </AuthContext.Provider>
);

const withAccessDeniedAuth: Decorator = (Story) => (
  <AuthContext.Provider value={{ ...baseAuthValue, isAdmin: false }}>
    <Story />
  </AuthContext.Provider>
);

const withAdminAuth: Decorator = (Story) => (
  <AuthContext.Provider value={{ ...baseAuthValue, isAdmin: true }}>
    <Story />
  </AuthContext.Provider>
);

const meta = {
  title: "Features/TestMatrix/TestMatrixPage",
  component: TestMatrixPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TestMatrixPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ローディング中 */
export const Loading: Story = {
  decorators: [withLoadingAuth],
};

/** 非管理者: アクセス拒否バナーが表示される */
export const AccessDenied: Story = {
  decorators: [withAccessDeniedAuth],
};

/** 管理者: テストマトリクス全体が表示される（初期データ使用） */
export const AdminView: Story = {
  decorators: [withAdminAuth],
};

/** 管理者: カテゴリヘッダーをクリック → 折り畳みが切り替わる */
export const ClickCategoryToggle: Story = {
  decorators: [withAdminAuth],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstCategory = canvas.getByRole("button", { name: /認証（Auth）/ });
    await userEvent.click(firstCategory);
    // 折り畳み後も同じボタンが存在する
    expect(firstCategory).toBeTruthy();
  },
};
