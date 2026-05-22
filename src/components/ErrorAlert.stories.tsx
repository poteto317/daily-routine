import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ErrorAlert } from "./ErrorAlert";

const meta = {
  title: "Components/ErrorAlert",
  component: ErrorAlert,
  parameters: {
    layout: "padded",
  },
  args: {
    onRetry: fn(),
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
  },
};

export const WithCustomRetryText: Story = {
  args: {
    error: "同期に失敗しました。インターネット接続を確認してください。",
    onRetry: fn(),
    retryButtonText: "もう一度試す",
  },
};
