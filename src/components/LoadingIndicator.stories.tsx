import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LoadingIndicator } from "./LoadingIndicator";

const meta = {
  title: "Components/LoadingIndicator",
  component: LoadingIndicator,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof LoadingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: "読み込み中...",
  },
};

export const WithSubMessage: Story = {
  args: {
    message: "データを取得しています",
    subMessage: "しばらくお待ちください",
  },
};

export const CustomStyle: Story = {
  args: {
    message: "同期中...",
    subMessage: "クラウドと接続しています",
    spinnerClassName:
      "animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500 mx-auto mb-4",
    messageClassName: "text-teal-700 text-base font-medium",
    subMessageClassName: "text-xs text-teal-500 mt-1",
  },
};
