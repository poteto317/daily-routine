import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { User } from "firebase/auth";
import { HeaderMenu } from "./HeaderMenu";
import type { HeaderMenuItem } from "@/hooks/useHeaderMenuItems";

const meta = {
  title: "Layouts/HeaderMenu",
  component: HeaderMenu,
  parameters: { layout: "padded" },
  args: {
    setIsMenuOpenAction: fn(),
    onNavigateAction: fn(),
    onLogoutAction: fn(),
  },
} satisfies Meta<typeof HeaderMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const menuItems: HeaderMenuItem[] = [
  { id: "home",     label: "ホーム",      icon: "🏠", route: "home" },
  { id: "budget",   label: "予算",        icon: "💰", route: "budget" },
  { id: "calendar", label: "カレンダー",  icon: "📅", route: "calendar" },
  { id: "settings", label: "設定",        icon: "⚙️", route: "settings" },
];

const loggedInUser = { isAnonymous: false, email: "user@example.com" } as User;
const anonymousUser = { isAnonymous: true, email: null } as User;

export const Closed: Story = {
  args: {
    isMenuOpen: false,
    currentPage: "home",
    filteredMenuItems: menuItems,
    user: loggedInUser,
  },
};

export const Open: Story = {
  args: {
    isMenuOpen: true,
    currentPage: "home",
    filteredMenuItems: menuItems,
    user: loggedInUser,
  },
};

export const OpenAnonymous: Story = {
  args: {
    isMenuOpen: true,
    currentPage: "home",
    filteredMenuItems: menuItems,
    user: anonymousUser,
  },
};

export const OpenSettingsActive: Story = {
  args: {
    isMenuOpen: true,
    currentPage: "settings",
    filteredMenuItems: menuItems,
    user: loggedInUser,
  },
};

/** ハンバーガーボタンをクリック → setIsMenuOpenAction が呼ばれる */
export const ClickToOpen: Story = {
  args: {
    isMenuOpen: false,
    currentPage: "home",
    filteredMenuItems: menuItems,
    user: loggedInUser,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggleButton = canvas.getByRole("button", { name: "メニュー" });
    await userEvent.click(toggleButton);
    expect(args.setIsMenuOpenAction).toHaveBeenCalledOnce();
  },
};

/** メニュー項目をクリック → onNavigateAction が正しいページで呼ばれる */
export const ClickMenuItemToNavigate: Story = {
  args: {
    isMenuOpen: true,
    currentPage: "home",
    filteredMenuItems: menuItems,
    user: loggedInUser,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const budgetItem = canvas.getByRole("menuitem", { name: /予算/ });
    await userEvent.click(budgetItem);
    expect(args.onNavigateAction).toHaveBeenCalledWith("budget");
  },
};
