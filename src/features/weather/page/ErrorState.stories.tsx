import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ErrorState } from "./ErrorState";

const meta = {
  title: "Features/Weather/ErrorState",
  component: ErrorState,
  parameters: { layout: "padded" },
  args: { onRetry: fn() },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { error: "位置情報の取得に失敗しました。" },
};

export const NetworkError: Story = {
  args: { error: "ネットワークに接続できません。インターネット接続を確認してください。" },
};
