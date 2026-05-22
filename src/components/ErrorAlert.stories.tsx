import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ErrorAlert } from "./ErrorAlert";

const meta = {
  title: "Components/ErrorAlert",
  component: ErrorAlert,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ErrorAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    error: "データの読み込みに失敗しました。",
  },
};

export const WithRetry: Story = {
  args: {
    error: "ネットワークエラーが発生しました。",
    onRetry: () => alert("再試行"),
  },
};

export const WithCustomRetryText: Story = {
  args: {
    error: "同期に失敗しました。インターネット接続を確認してください。",
    onRetry: () => {},
    retryButtonText: "もう一度試す",
  },
};
