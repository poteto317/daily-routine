import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { User } from "firebase/auth";
import { HeaderMenuPanel } from "./HeaderMenuPanel";
import type { HeaderMenuItem } from "@/hooks/useHeaderMenuItems";

const meta = {
  title: "Layouts/HeaderMenuPanel",
  component: HeaderMenuPanel,
  parameters: { layout: "padded" },
  args: {
    panelId: "header-menu-panel",
    setMenuItemRef: fn(),
    onNavigateClick: fn(),
    onLogoutClick: fn(),
    onMenuItemKeyDown: fn(),
  },
} satisfies Meta<typeof HeaderMenuPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const menuItems: HeaderMenuItem[] = [
  { id: "home", label: "ホーム", icon: "🏠", route: "home" },
  { id: "budget", label: "予算", icon: "💰", route: "budget" },
  { id: "calendar", label: "カレンダー", icon: "📅", route: "calendar" },
  { id: "settings", label: "設定", icon: "⚙️", route: "settings" },
];

const user = { isAnonymous: false, email: "user@example.com" } as User;

export const LoggedIn: Story = {
  args: { filteredMenuItems: menuItems, currentPage: "home", user },
};

export const Anonymous: Story = {
  args: {
    filteredMenuItems: menuItems,
    currentPage: "home",
    user: { isAnonymous: true, email: null } as User,
  },
};

export const SettingsActive: Story = {
  args: { filteredMenuItems: menuItems, currentPage: "settings", user },
};

export const NoMenuItems: Story = {
  args: { filteredMenuItems: [], currentPage: "home", user },
};

/** ナビゲーション項目をクリック → onNavigateClick が呼ばれる */
export const ClickNavigate: Story = {
  args: { filteredMenuItems: menuItems, currentPage: "home", user },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const budgetItem = canvas.getByRole("menuitem", { name: /予算/ });
    await userEvent.click(budgetItem);
    expect(args.onNavigateClick).toHaveBeenCalledWith("budget");
  },
};
