import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import type { User } from "firebase/auth";
import { LoginPage } from "./LoginPage";
import { AuthContext } from "@/features/auth/context/AuthContextInstance";
import type { AuthContextType } from "@/features/auth/context/types";

// LoginPage は useLoginActionHandlers() → useAuth() を呼び出すため AuthContext.Provider が必要。
// Storybook 環境では isFirebaseConfigured = false かつ isLocalAuthEnabled = false のため
// authUnavailable バナー（Firebase 設定が必要）が表示される。

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
  title: "Features/Auth/LoginPage",
  component: LoginPage,
  parameters: { layout: "fullscreen" },
  decorators: [withAuthContext],
} satisfies Meta<typeof LoginPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
