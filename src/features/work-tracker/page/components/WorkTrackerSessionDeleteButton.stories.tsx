import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { WorkTrackerSessionDeleteButton } from "./WorkTrackerSessionDeleteButton";

const meta = {
  title: "Features/WorkTracker/WorkTrackerSessionDeleteButton",
  component: WorkTrackerSessionDeleteButton,
  parameters: {
    layout: "padded",
  },
  args: {
    onDelete: fn(),
  },
} satisfies Meta<typeof WorkTrackerSessionDeleteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ClickDelete: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /削除/ });
    await userEvent.click(button);
    expect(args.onDelete).toHaveBeenCalledOnce();
  },
};
