import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { User } from "firebase/auth";
import { HeaderMenuFooter } from "./HeaderMenuFooter";

const meta = {
  title: "Layouts/HeaderMenuFooter",
  component: HeaderMenuFooter,
  parameters: { layout: "padded" },
  args: {
    logoutItemIndex: 0,
    setMenuItemRef: fn(),
    onLogoutClick: fn(),
    onMenuItemKeyDown: fn(),
  },
} satisfies Meta<typeof HeaderMenuFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

const regularUser = { isAnonymous: false, email: "user@example.com" } as User;
const anonymousUser = { isAnonymous: true, email: null } as User;

export const LoggedIn: Story = {
  args: { user: regularUser },
};

export const Anonymous: Story = {
  args: { user: anonymousUser },
};

export const NoUser: Story = {
  args: { user: null },
};

/** ログアウトボタンをクリック → onLogoutClick が呼ばれる */
export const ClickLogout: Story = {
  args: { user: regularUser },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const logoutButton = canvas.getByRole("menuitem", { name: /ログアウト/ });
    await userEvent.click(logoutButton);
    expect(args.onLogoutClick).toHaveBeenCalledOnce();
  },
};
