import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { HeaderMenuItemButton } from "./HeaderMenuItemButton";
import type { HeaderMenuItem } from "@/hooks/useHeaderMenuItems";

const meta = {
  title: "Layouts/HeaderMenuItemButton",
  component: HeaderMenuItemButton,
  parameters: { layout: "padded" },
  args: {
    setMenuItemRef: fn(),
    onNavigateClick: fn(),
    onMenuItemKeyDown: fn(),
  },
} satisfies Meta<typeof HeaderMenuItemButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const homeItem: HeaderMenuItem = {
  id: "home",
  label: "ホーム",
  icon: "🏠",
  route: "home",
};

const budgetItemWithBadge: HeaderMenuItem = {
  id: "budget",
  label: "予算",
  icon: "💰",
  route: "budget",
  badge: { text: "NEW", color: "bg-red-500" },
};

export const Default: Story = {
  args: { item: homeItem, index: 0, currentPage: "settings" },
};

export const Active: Story = {
  args: { item: homeItem, index: 0, currentPage: "home" },
};

export const WithBadge: Story = {
  args: { item: budgetItemWithBadge, index: 1, currentPage: "home" },
};

export const WithBadgeActive: Story = {
  args: { item: budgetItemWithBadge, index: 1, currentPage: "budget" },
};

/** クリック → onNavigateClick("home") が呼ばれる */
export const ClickToNavigate: Story = {
  args: { item: homeItem, index: 0, currentPage: "settings" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const menuItem = canvas.getByRole("menuitem", { name: /ホーム/ });
    await userEvent.click(menuItem);
    expect(args.onNavigateClick).toHaveBeenCalledWith("home");
  },
};
