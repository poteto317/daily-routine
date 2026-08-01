import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { AddItemPositionToggleButton } from "./AddItemPositionToggleButton";

const meta = {
  title: "Features/TodoLists/AddItemPositionToggleButton",
  component: AddItemPositionToggleButton,
  parameters: { layout: "padded" },
  args: { onToggleAction: fn() },
} satisfies Meta<typeof AddItemPositionToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const First: Story = {
  args: { addItemPosition: "first" },
};

export const Last: Story = {
  args: { addItemPosition: "last" },
};

export const ClickToToggle: Story = {
  args: { addItemPosition: "first" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await userEvent.click(button);
    expect(args.onToggleAction).toHaveBeenCalledWith("last");
  },
};
