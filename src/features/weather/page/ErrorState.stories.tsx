import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
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
  args: {
    error:
      "ネットワークに接続できません。インターネット接続を確認してください。",
  },
};

/** 「再読み込み」ボタンをクリック → onRetry が呼ばれる */
export const ClickRetry: Story = {
  args: { error: "位置情報の取得に失敗しました。" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const retryButton = canvas.getByRole("button", { name: "再読み込み" });
    await userEvent.click(retryButton);
    expect(args.onRetry).toHaveBeenCalledOnce();
  },
};
