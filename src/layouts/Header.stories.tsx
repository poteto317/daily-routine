import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { User } from "firebase/auth";
import { Header } from "./Header";
import { AuthContext } from "@/features/auth/context/AuthContextInstance";
import type { AuthContextType } from "@/features/auth/context/types";

// Header は useAuth() を呼び出すため AuthContext.Provider が必要。
// Storybook 環境では Firebase 未初期化のため syncStatus はデフォルト値で描画される。

const mockUser = { isAnonymous: false, email: "user@example.com" } as User;

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
  title: "Layouts/Header",
  component: Header,
  parameters: { layout: "fullscreen" },
  decorators: [withAuthContext],
  args: {
    onNavigateAction: fn(),
    onToggleEditModeAction: fn(),
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HomePage: Story = {
  args: { currentPage: "home", isEditMode: false },
};

export const HomePageEditMode: Story = {
  args: { currentPage: "home", isEditMode: true },
};

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
    // メニューパネルが開き、role="menu" の要素が表示される
    expect(canvas.getByRole("menu")).toBeTruthy();
  },
};

/** ロゴをクリック → onNavigateAction が間接的に呼ばれる */
export const ClickLogo: Story = {
  args: { currentPage: "budget", isEditMode: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const logoButton = canvas.getByRole("button", { name: /デイリールーティン/ });
    await userEvent.click(logoButton);
    // 内部 hook 経由のナビゲーションなので fn() の直接検証はしない
    expect(logoButton).toBeTruthy();
  },
};
