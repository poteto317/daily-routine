import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { HeaderEditModeButton } from "./HeaderEditModeButton";

const meta = {
  title: "Layouts/HeaderEditModeButton",
  component: HeaderEditModeButton,
  parameters: { layout: "padded" },
  args: { onToggleEditModeAction: fn() },
} satisfies Meta<typeof HeaderEditModeButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ViewMode: Story = {
  args: { isEditMode: false },
};

export const EditMode: Story = {
  args: { isEditMode: true },
};

export const ClickToEnterEdit: Story = {
  args: { isEditMode: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await userEvent.click(button);
    expect(args.onToggleEditModeAction).toHaveBeenCalledOnce();
  },
};
