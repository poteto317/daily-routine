import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { StorageWriteFailureBanner } from "./StorageWriteFailureBanner";

const meta = {
  title: "Components/StorageWriteFailureBanner",
  component: StorageWriteFailureBanner,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    onDismiss: fn(),
  },
} satisfies Meta<typeof StorageWriteFailureBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 保存容量の上限に達した場合。不要データの削除まで案内する */
export const QuotaExceeded: Story = {
  args: {
    reason: "quota-exceeded",
  },
};

/** 上限超過以外の理由で保存できなかった場合 */
export const Unknown: Story = {
  args: {
    reason: "unknown",
  },
};

/** 「閉じる」をクリック → onDismiss が呼ばれる */
export const ClickDismiss: Story = {
  args: {
    reason: "quota-exceeded",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const dismissButton = canvas.getByRole("button", { name: "閉じる" });
    await userEvent.click(dismissButton);
    expect(args.onDismiss).toHaveBeenCalledOnce();
  },
};
