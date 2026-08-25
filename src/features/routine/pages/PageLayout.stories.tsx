import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { User } from "firebase/auth";
import { PageLayout } from "./PageLayout";
import { AuthContext } from "@/features/auth/context/AuthContextInstance";
import type { AuthContextType } from "@/features/auth/context/types";

// PageLayout は内部の Header が useAuth() を呼び出すため AuthContext.Provider が必要。
//
// currentPage に "home" を指定した場合は children がそのまま描画される
//（ページコンポーネントの複雑な hooks を避けられる）。
// 機能ページを指定した場合は resolver が解決したページ内容が描画される。

const mockUser = {
  isAnonymous: false,
  email: "user@example.com",
} as User;

const mockAuthValue: AuthContextType = {
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

const withAuthContext: Decorator = (Story) => (
  <AuthContext.Provider value={mockAuthValue}>
    <Story />
  </AuthContext.Provider>
);

const meta = {
  title: "Features/Routine/PageLayout",
  component: PageLayout,
  parameters: { layout: "fullscreen" },
  decorators: [withAuthContext],
  args: {
    onNavigateAction: fn(),
    onToggleEditModeAction: fn(),
    children: (
      <div className="p-6 text-gray-700 dark:text-gray-200">
        <p className="text-sm">ページコンテンツ</p>
      </div>
    ),
  },
} satisfies Meta<typeof PageLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ホームナビゲーション（通常モード）: children がそのまま表示される */
export const HomeNormal: Story = {
  args: { currentPage: "home", isEditMode: false },
};

/** ホームナビゲーション（編集モード）: ヘッダーが編集モード表示 */
export const HomeEditMode: Story = {
  args: { currentPage: "home", isEditMode: true },
};

/** 他ページ選択時: ヘッダーのナビゲーション表示が変わる */
export const OtherPage: Story = {
  args: { currentPage: "budget", isEditMode: false },
};

/** ハンバーガーボタンをクリック → メニューが開く */
export const ClickHamburger: Story = {
  args: { currentPage: "home", isEditMode: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menuButton = canvas.getByRole("button", { name: "メニュー" });
    await userEvent.click(menuButton);
    expect(canvas.getByRole("menu")).toBeTruthy();
  },
};
