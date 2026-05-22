import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { RoutineFormHeader } from "./RoutineFormHeader";

const meta = {
  title: "Features/Routine/RoutineFormHeader",
  component: RoutineFormHeader,
  parameters: {
    layout: "padded",
  },
  args: {
    onCancel: fn(),
  },
} satisfies Meta<typeof RoutineFormHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AddMode: Story = {
  args: { isEditMode: false },
};

export const EditMode: Story = {
  args: { isEditMode: true },
};

export const ClickClose: Story = {
  args: { isEditMode: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const closeButton = canvas.getByRole("button", { name: /閉じる|close/i });
    await userEvent.click(closeButton);
    expect(args.onCancel).toHaveBeenCalledOnce();
  },
};
