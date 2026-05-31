import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { AccountAdminToolbar } from "./AccountAdminToolbar";

const meta = {
  title: "Features/AccountAdmin/AccountAdminToolbar",
  component: AccountAdminToolbar,
  parameters: { layout: "padded" },
  args: {
    onToggleCreateForm: fn(),
    onRefresh: fn(),
  },
} satisfies Meta<typeof AccountAdminToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 「新規アカウント作成」ボタンをクリック → onToggleCreateForm が呼ばれる */
export const ClickToggleCreateForm: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /新規アカウント作成/ });
    await userEvent.click(button);
    expect(args.onToggleCreateForm).toHaveBeenCalledOnce();
  },
};

/** 「更新」ボタンをクリック → onRefresh が呼ばれる */
export const ClickRefresh: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /更新/ });
    await userEvent.click(button);
    expect(args.onRefresh).toHaveBeenCalledOnce();
  },
};
