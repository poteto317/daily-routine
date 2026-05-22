import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { AccountAdminErrorAlert } from "./AccountAdminErrorAlert";

const meta = {
  title: "Features/AccountAdmin/AccountAdminErrorAlert",
  component: AccountAdminErrorAlert,
  parameters: { layout: "padded" },
  args: { onClose: fn() },
} satisfies Meta<typeof AccountAdminErrorAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { error: "ユーザーの削除中にエラーが発生しました。" },
};

export const LongError: Story = {
  args: { error: "Firebase の権限エラー: このアカウントを削除する権限がありません。管理者にお問い合わせください。" },
};
